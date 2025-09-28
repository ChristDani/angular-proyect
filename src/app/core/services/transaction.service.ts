import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ITransaction } from '../../models/interfaces/transaction.interface';
import { AccountService } from './account.service';
import { Account } from '../../models/interfaces/account.interface';
import { CurrencyService } from './currency.service';
import { ModalConfirmOp } from '../../shared/components/modals/modal-confirm-op/modal-confirm-op';
import { OperationConfirmData } from '../../shared/interfaces/operation-confirm.interface';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/transactions';

  private accountsSvc = inject(AccountService);
  private currencyService = inject(CurrencyService);
  private dialog = inject(MatDialog);

  constructor(private http: HttpClient) { }

  private showConfirmModal(data: OperationConfirmData): void {
    setTimeout(() => {
      this.dialog.open(ModalConfirmOp, {
        data,
        width: '90%',
        maxWidth: '500px',
        disableClose: false,
        panelClass: 'custom-modal-container'
      });
    }, 300); // Pequeño delay para que se cierre el modal anterior
  }

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
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
    amount: number,
    currency: 'USD' | 'PEN' = 'PEN'
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
        // Convertir el monto a la moneda de la cuenta origen para validar saldo
        const amountInFromCurrency = this.currencyService.convertToAccountCurrency(amount, currency, from.currency);
        if (from.balance < amountInFromCurrency) throw new Error('Saldo insuficiente en la cuenta de origen');
        
        // Convertir el monto a la moneda de cada cuenta
        const amountForFrom = this.currencyService.convertToAccountCurrency(amount, currency, from.currency);
        const amountForTo = this.currencyService.convertToAccountCurrency(amount, currency, to.currency);
        
        return { from, to, amountForFrom, amountForTo };
      }),
      switchMap(({ from, to, amountForFrom, amountForTo }) => {
        const updatedFrom = { ...from, balance: from.balance - amountForFrom };
        const updatedTo   = { ...to,   balance: to.balance + amountForTo };

        // 1) actualizar saldos
        return forkJoin([
          this.accountsSvc.updateAccount(updatedFrom),
          this.accountsSvc.updateAccount(updatedTo),
        ]).pipe(
          // 2) registrar transacciones
           switchMap(() => {
             const now = new Date().toISOString();
             const transferId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

             const retiro: ITransaction = {
               id: transferId,
               accountId: from.id,
               date: now,
               type: 'retiro',         
               amount: -Math.abs(amountForFrom),
               description: `Transferencia a ${to.type?.toUpperCase?.() ?? to.id}`,
               currency: from.currency
             };

             const deposito: ITransaction = {
               id: transferId,
               accountId: to.id,
               date: now,
               type: 'depósito',   
               amount: Math.abs(amountForTo),
               description: `Transferencia desde ${from.type?.toUpperCase?.() ?? from.id}`,
               currency: to.currency
             };

            return forkJoin([
              this.createTransaction(retiro),
              this.createTransaction(deposito)
            ]).pipe(
              tap(() => {
                // Preparar datos para el modal de confirmación
                const confirmData: OperationConfirmData = {
                  success: true,
                  type: 'transfer-between-accounts',
                  operationId: transferId,
                  timestamp: now,
                  amount: amount,
                  currency: currency,
                  fromAccount: {
                    id: from.id,
                    type: from.type,
                    balance: updatedFrom.balance,
                    currency: from.currency
                  },
                  toAccount: {
                    id: to.id,
                    type: to.type,
                    balance: updatedTo.balance,
                    currency: to.currency
                  }
                };

                // Si hay conversión de moneda, agregamos la información
                if (currency !== from.currency || currency !== to.currency) {
                  const needsConversion = currency !== from.currency;
                  if (needsConversion) {
                    confirmData.convertedAmount = amountForFrom;
                    confirmData.convertedCurrency = from.currency;
                    confirmData.exchangeRate = this.currencyService.getExchangeRate(currency, from.currency);
                  }
                }

                this.showConfirmModal(confirmData);
              }),
              map(() => ({ ok: true as const }))
            );
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
      currency: 'USD' | 'PEN' = 'PEN',
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
              
              // Convertir el monto a la moneda de cada cuenta
              const amountForFrom = this.currencyService.convertToAccountCurrency(amount, currency, from.currency);
              const amountForTo = this.currencyService.convertToAccountCurrency(amount, currency, to.currency);
              
              if (from.balance < amountForFrom) return throwError(() => new Error('Saldo insuficiente en la cuenta de origen'));

              const updatedFrom = { ...from, balance: from.balance - amountForFrom };
              const updatedTo   = { ...to,   balance: to.balance + amountForTo };
              const now = new Date().toISOString();
  
             const transferId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

              const retiro: ITransaction = {
                id: transferId,
                accountId: from.id,
                date: now,
                type: 'retiro',           // siempre negativo
                amount: -Math.abs(amountForFrom),
                description: description?.trim() || `Transferencia a ${to.id}`,
                currency: from.currency
              };
              const deposito: ITransaction = {
                id: transferId,
                accountId: to.id,
                date: now,
                type: 'depósito',         // siempre positivo
                amount: Math.abs(amountForTo),
                description: description?.trim() || `Transferencia desde ${from.id}`,
                currency: to.currency
              };
  
              // 2) Actualizar saldos y 3) registrar transacciones
              return forkJoin([
                this.accountsSvc.updateAccount(updatedFrom),
                this.accountsSvc.updateAccount(updatedTo),
              ]).pipe(
                switchMap(() => forkJoin([ this.createTransaction(retiro), this.createTransaction(deposito) ])),
                tap(() => {
                  // Preparar datos para el modal de confirmación
                  const confirmData: OperationConfirmData = {
                    success: true,
                    type: 'transfer-to-third',
                    operationId: transferId,
                    timestamp: now,
                    amount: amount,
                    currency: currency,
                    fromAccount: {
                      id: from.id,
                      type: from.type,
                      balance: updatedFrom.balance,
                      currency: from.currency
                    },
                    thirdPartyAccount: toAccountId,
                    description: description
                  };

                  // Si hay conversión de moneda, agregamos la información
                  if (currency !== from.currency) {
                    confirmData.convertedAmount = amountForFrom;
                    confirmData.convertedCurrency = from.currency;
                    confirmData.exchangeRate = this.currencyService.getExchangeRate(currency, from.currency);
                  }

                  this.showConfirmModal(confirmData);
                }),
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
    currency: 'USD' | 'PEN' = 'PEN',
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
        
        // Convertir el monto a la moneda de la cuenta
        const amountInAccountCurrency = this.currencyService.convertToAccountCurrency(amount, currency, from.currency);
        if (from.balance < amountInAccountCurrency) throw new Error('Saldo insuficiente en la cuenta');

        // 2) Actualizar saldo de la cuenta
        const updatedFrom = { ...from, balance: from.balance - amountInAccountCurrency };
        const now = new Date().toISOString();
        const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        // 3) Crear transacción de pago de servicio
        const pagoServicio: ITransaction = {
          id: paymentId,
          accountId: from.id,
          date: now,
          type: 'pago serv',   // siempre negativo
          amount: -Math.abs(amountInAccountCurrency), // Siempre negativo porque es un gasto
          description: description?.trim() || `Pago de ${serviceName} (${serviceId})`,
          currency: from.currency
        };

        // 4) Actualizar cuenta y registrar transacción
        return forkJoin([
          this.accountsSvc.updateAccount(updatedFrom),
          this.createTransaction(pagoServicio)
        ]).pipe(
          tap(() => {
            // Preparar datos para el modal de confirmación
            const confirmData: OperationConfirmData = {
              success: true,
              type: 'service-payment',
              operationId: paymentId,
              timestamp: now,
              amount: amount,
              currency: currency,
              fromAccount: {
                id: from.id,
                type: from.type,
                balance: updatedFrom.balance,
                currency: from.currency
              },
              service: {
                id: serviceId,
                name: serviceName,
                category: 'Servicios'
              },
              description: description
            };

            // Si hay conversión de moneda, agregamos la información
            if (currency !== from.currency) {
              confirmData.convertedAmount = amountInAccountCurrency;
              confirmData.convertedCurrency = from.currency;
              confirmData.exchangeRate = this.currencyService.getExchangeRate(currency, from.currency);
            }

            this.showConfirmModal(confirmData);
          }),
          map(() => ({ ok: true as const }))
        );
      })
    );
  }
}
