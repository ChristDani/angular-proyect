import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { ITransaction } from '../../models/interfaces/transaction.interface';
import { AccountService } from './account.service';
import { Account } from '../../models/interfaces/account.interface';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/transactions';

  private accountsSvc = inject(AccountService);

  constructor(private http: HttpClient) { }

  createTransaction(transaction: ITransaction): Observable<ITransaction> {
    return this.http.post<ITransaction>(this.apiUrl, transaction);
  }

  getTransactions(): Observable<ITransaction[]> {
    return this.http.get<ITransaction[]>(this.apiUrl);
  }

  getTransactionById(id: number): Observable<ITransaction> {
    return this.http.get<ITransaction>(`${this.apiUrl}/${id}`);
  }

  updateTransaction(transaction: ITransaction): Observable<ITransaction> {
    return this.http.put<ITransaction>(`${this.apiUrl}/${transaction.id}`, transaction);
  }

  deleteTransaction(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTransactionsByAccount(accountId: string) {
    const params = new HttpParams().set('accountId', accountId);
    return this.http.get<ITransaction[]>(`${this.apiUrl}`, { params });
  }

  getAllUserTransactions(userId: string) {
    return this.accountsSvc.getAccountsByUserId(userId).pipe(
      switchMap(accounts => accounts.length
        ? forkJoin(accounts.map(a => this.getTransactionsByAccount(a.id)))
        : of([] as ITransaction[][])
      ),
      map(lists => lists.flat()
        .map(t => ({ ...t, currency: t.currency ?? 'PEN' }))
        .sort((a, b) => b.date.localeCompare(a.date))
      )
    );
  }


   /**
   * Transferencia entre cuentas del mismo usuario.
   * - Carga cuentas del usuario y valida existencia.
   * - Valida from != to, monto > 0 y saldo suficiente.
   * - Actualiza saldos.
   * - Crea 2 transacciones: retiro (negativo) y deposito (positivo).
   */
   transferBetweenAccounts(
    userId: string | null,
    fromId: string,
    toId: string,
    amount: number
  ): Observable<{ ok: true }> {
    if (userId == null) return throwError(() => new Error('No hay sesion')); 
    if (!fromId || !toId) return throwError(() => new Error('Cuentas inválidas'));
    if (fromId === toId)  return throwError(() => new Error('Las cuentas no pueden ser iguales'));
    if (!(amount > 0))    return throwError(() => new Error('El monto debe ser mayor que 0'));

    return this.accountsSvc.getAccountsByUserId(userId).pipe(
      map(accounts => {
        const from = accounts.find(a => a.id === fromId);
        const to   = accounts.find(a => a.id === toId);
        if (!from || !to) throw new Error('No se encontraron las cuentas seleccionadas');
        if (from.status === 'inactiva' || to.status === 'inactiva') {
          throw new Error('Alguna de las cuentas está inactiva');
        }
        if (from.balance < amount) throw new Error('Saldo insuficiente en la cuenta de origen');
        return { from, to };
      }),
      switchMap(({ from, to }) => {
        const updatedFrom = { ...from, balance: from.balance - amount };
        const updatedTo   = { ...to,   balance: to.balance + amount };

        // 1) actualizar saldos
        return forkJoin([
          this.accountsSvc.updateAccount(updatedFrom),
          this.accountsSvc.updateAccount(updatedTo),
        ]).pipe(
          // 2) registrar transacciones
           switchMap(() => {
             const today = new Date().toISOString().slice(0, 10);
             const transferId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

             const retiro: ITransaction = {
               id: transferId,
               accountId: from.id,
               date: today,
               type: 'retiro',         
               amount: -Math.abs(amount),
               description: `Transferencia a ${to.type?.toUpperCase?.() ?? to.id}`,
               currency: 'PEN'
             };

             const deposito: ITransaction = {
               id: transferId,
               accountId: to.id,
               date: today,
               type: 'deposito',   
               amount: Math.abs(amount),
               description: `Transferencia desde ${from.type?.toUpperCase?.() ?? from.id}`,
               currency: 'PEN'
             };

            return forkJoin([
              this.createTransaction(retiro),
              this.createTransaction(deposito)
            ]).pipe(map(() => ({ ok: true as const })));
          })
        );
      })
    );
  }

    /** Transferencia a terceros:
   * - Verifica cuentas y saldo
   * - Actualiza saldos
   * - Crea 2 movimientos: retiro (-) en origen y depósito (+) en destino
   * - Devuelve { ok: true }
   */
    transferToThirdParty(
      userId: string,
      fromId: string,
      toAccountId: string,
      amount: number,
      description?: string
    ): Observable<{ ok: true }> {
      if (!fromId || !toAccountId) return throwError(() => new Error('Cuentas inválidas'));
      if (fromId === toAccountId)  return throwError(() => new Error('La cuenta destino no puede ser la misma'));
      if (!(amount > 0))          return throwError(() => new Error('El monto debe ser mayor que 0'));
  
      // 1) Cargar cuenta origen del usuario y cuenta destino
      return this.accountsSvc.getAccountsByUserId(userId).pipe(
        switchMap((userAccounts: Account[]) => {
          const from = userAccounts.find(a => a.id === fromId);
          if (!from) throw new Error('Cuenta de origen no encontrada para el usuario');
          if (from.status === 'inactiva') throw new Error('La cuenta de origen está inactiva');
  
          return this.accountsSvc.getAccountById(toAccountId).pipe(
            switchMap((to: Account | null) => {
              if (!to) return throwError(() => new Error('La cuenta destino no existe'));
              if (to.status === 'inactiva') return throwError(() => new Error('La cuenta destino está inactiva'));
              if (from.balance < amount) return throwError(() => new Error('Saldo insuficiente en la cuenta de origen'));
  
              const updatedFrom = { ...from, balance: from.balance - amount };
              const updatedTo   = { ...to,   balance: to.balance + amount };
              const today = new Date().toISOString().slice(0, 10);
  
             const transferId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

              const retiro: ITransaction = {
                id: transferId,
                accountId: from.id,
                date: today,
                type: 'retiro',           // siempre negativo
                amount: -Math.abs(amount),
                description: description?.trim() || `Transferencia a ${to.id}`,
                currency: 'PEN'
              };
              const deposito: ITransaction = {
                id: transferId,
                accountId: to.id,
                date: today,
                type: 'deposito',         // siempre positivo
                amount: Math.abs(amount),
                description: description?.trim() || `Transferencia desde ${from.id}`,
                currency: 'PEN'
              };
  
              // 2) Actualizar saldos y 3) registrar transacciones
              return forkJoin([
                this.accountsSvc.updateAccount(updatedFrom),
                this.accountsSvc.updateAccount(updatedTo),
              ]).pipe(
                switchMap(() => forkJoin([ this.createTransaction(retiro), this.createTransaction(deposito) ])),
                map(() => ({ ok: true as const }))
              );
            })
          );
        })
      );
    }

  /**
   * Pago de servicios:
   * - Verifica cuenta del usuario y saldo suficiente
   * - Actualiza saldo de la cuenta
   * - Crea transacción de pago de servicio (negativa)
   * - Devuelve { ok: true }
   */
  payService(
    userId: string,
    fromId: string,
    serviceId: string,
    serviceName: string,
    amount: number,
    description?: string
  ): Observable<{ ok: true }> {
    if (!fromId || !serviceId) return throwError(() => new Error('Datos inválidos'));
    if (!(amount > 0)) return throwError(() => new Error('El monto debe ser mayor que 0'));

    // 1) Cargar cuenta del usuario y validar
    return this.accountsSvc.getAccountsByUserId(userId).pipe(
      switchMap((userAccounts: Account[]) => {
        const from = userAccounts.find(a => a.id === fromId);
        if (!from) throw new Error('Cuenta no encontrada para el usuario');
        if (from.status === 'inactiva') throw new Error('La cuenta está inactiva');
        if (from.balance < amount) throw new Error('Saldo insuficiente en la cuenta');

        // 2) Actualizar saldo de la cuenta
        const updatedFrom = { ...from, balance: from.balance - amount };
        const today = new Date().toISOString().slice(0, 10);
        const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        // 3) Crear transacción de pago de servicio
        const pagoServicio: ITransaction = {
          id: paymentId,
          accountId: from.id,
          date: today,
          type: 'PAGO SERV',
          amount: -Math.abs(amount), // Siempre negativo porque es un gasto
          description: description?.trim() || `Pago de ${serviceName} (${serviceId})`,
          currency: 'PEN'
        };

        // 4) Actualizar cuenta y registrar transacción
        return forkJoin([
          this.accountsSvc.updateAccount(updatedFrom),
          this.createTransaction(pagoServicio)
        ]).pipe(
          map(() => ({ ok: true as const }))
        );
      })
    );
  }
}
