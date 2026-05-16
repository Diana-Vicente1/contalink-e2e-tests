import { randomUUID } from 'crypto';

export type InvoiceStatus =
  | 'Vigente'
  | 'Pendiente'
  | 'Pagado'
  | 'Vencido'
  | 'Cancelado';

export type InvoiceData = {
  invoiceNumber: string;
  total: string;
  state: InvoiceStatus;
};

const uniqueId = (): string => {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
};

export const createInvoiceData = (): InvoiceData => {
  return {
    invoiceNumber: `FAC-DVD-${uniqueId()}`,
    total: '1500.50',
    state: 'Pendiente',
  };
};

export const createEditedInvoiceData = (): InvoiceData => {
  return {
    invoiceNumber: `FAC-DVD-EDIT-${uniqueId()}`,
    total: '2500.75',
    state: 'Pagado',
  };
};