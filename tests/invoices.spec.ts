import {test} from '@playwright/test'
import { LoginPage } from '../pages/LoginPage';
import { InvoicePage } from '../pages/InvoicePage'
import { createInvoiceData, createEditedInvoiceData } from '../test-data/invoice.data'
const accessCode = process.env.ACCESS_CODE ?? '';

test.describe('Invoices', () =>{
   
    test.beforeEach(async ({page}) =>{
        const loginPage = new LoginPage(page);
        await loginPage.goTo();
        await loginPage.login(accessCode);
        await loginPage.expectLoginSuccessful();
    });

    test('should create a new Invoice', async ({page}) => {
       const invoicePage = new InvoicePage(page);
       const invoice = createInvoiceData();
       await invoicePage.createNewInvoice(invoice.invoiceNumber, invoice.total, invoice.state);
       await invoicePage.searchInvoiceByNumber(invoice.invoiceNumber);
       await invoicePage.validateInvoiceVisible(invoice.invoiceNumber);
    });
    test('should edit an invoice', async ({page}) =>{
       const invoicePage = new InvoicePage(page);
       const invoice = createInvoiceData();
       const editedInvoice = createEditedInvoiceData();
       await invoicePage.createNewInvoice(invoice.invoiceNumber, invoice.total, invoice.state);
       await invoicePage.searchInvoiceByNumber(invoice.invoiceNumber);
       await invoicePage.validateInvoiceVisible(invoice.invoiceNumber);
       await invoicePage.editInvoice(invoice.invoiceNumber, editedInvoice.invoiceNumber, editedInvoice.total, editedInvoice.state)
       await invoicePage.searchInvoiceByNumber(editedInvoice.invoiceNumber);
       await invoicePage.validateInvoiceVisible(editedInvoice.invoiceNumber);


    })
     test('should delete an invoice', async ({page}) =>{
        const invoicePage = new InvoicePage(page);
        const invoice = createInvoiceData();
        await invoicePage.createNewInvoice(invoice.invoiceNumber, invoice.total, invoice.state);
        await invoicePage.searchInvoiceByNumber(invoice.invoiceNumber);
        await invoicePage.validateInvoiceVisible(invoice.invoiceNumber);
        await invoicePage.deleteInvoice(invoice.invoiceNumber);
        await invoicePage.clearFilters();
     })

});