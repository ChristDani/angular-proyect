import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  // Tasa de cambio fija - En un escenario real, esto vendría de una API externa
  private readonly USD_TO_PEN_RATE = 3.75;
  private readonly PEN_TO_USD_RATE = 1 / this.USD_TO_PEN_RATE;

  constructor() {}

  /**
   * Convierte de USD a PEN
   * @param usdAmount Cantidad en dólares
   * @returns Cantidad equivalente en soles
   */
  convertUsdToPen(usdAmount: number): number {
    return Math.round((usdAmount * this.USD_TO_PEN_RATE) * 100) / 100;
  }

  /**
   * Convierte de PEN a USD
   * @param penAmount Cantidad en soles
   * @returns Cantidad equivalente en dólares
   */
  convertPenToUsd(penAmount: number): number {
    return Math.round((penAmount * this.PEN_TO_USD_RATE) * 100) / 100;
  }

  /**
   * Convierte cualquier cantidad entre monedas
   * @param amount Cantidad a convertir
   * @param fromCurrency Moneda origen ('USD' | 'PEN')
   * @param toCurrency Moneda destino ('USD' | 'PEN')
   * @returns Cantidad convertida
   */
  convertCurrency(amount: number, fromCurrency: 'USD' | 'PEN', toCurrency: 'USD' | 'PEN'): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    if (fromCurrency === 'USD' && toCurrency === 'PEN') {
      return this.convertUsdToPen(amount);
    }

    if (fromCurrency === 'PEN' && toCurrency === 'USD') {
      return this.convertPenToUsd(amount);
    }

    return amount;
  }

  /**
   * Convierte cualquier cantidad a la moneda base de la cuenta
   * Útil para validar saldos cuando las monedas son diferentes
   * @param amount Cantidad a convertir
   * @param fromCurrency Moneda de la cantidad
   * @param accountCurrency Moneda de la cuenta
   * @returns Cantidad en la moneda de la cuenta
   */
  convertToAccountCurrency(amount: number, fromCurrency: 'USD' | 'PEN', accountCurrency: 'USD' | 'PEN'): number {
    return this.convertCurrency(amount, fromCurrency, accountCurrency);
  }

  /**
   * Obtiene la tasa de cambio actual
   * @returns Objeto con las tasas de cambio
   */
  getExchangeRates() {
    return {
      USD_TO_PEN: this.USD_TO_PEN_RATE,
      PEN_TO_USD: this.PEN_TO_USD_RATE
    };
  }

  /**
   * Formatea el monto con el símbolo de la moneda
   * @param amount Cantidad
   * @param currency Moneda ('USD' | 'PEN')
   * @returns String formateado con símbolo de moneda
   */
  formatCurrency(amount: number, currency: 'USD' | 'PEN'): string {
    const symbol = currency === 'USD' ? '$' : 'S/';
    return `${symbol} ${amount.toFixed(2)}`;
  }
}