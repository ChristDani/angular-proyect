export interface Client {
  id: string;
  name: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  accountType?: 'debito' | 'ahorro' | string;
}

export type ProductType = 'cuenta' | 'tarjeta' | 'prestamo';
export type SubType = {
  value: 'debito' | 'ahorro' | 'crédito';
  label: string;
};

export interface Product {
  id?: string;
  clientId: string;
  accountId?: string | null;
  productType: ProductType;
  subType?: SubType | null;
  creditLimit?: number | null;
  createdAt?: string;
}

export interface DialogData {
  client: Client;
  accounts?: Account[]; // cuentas del cliente/usuario si las tiene
  type?: string; // tipo de producto a crear
}
