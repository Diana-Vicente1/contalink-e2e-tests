import {Page, Locator, expect} from '@playwright/test';

export class InvoicePage{
    readonly page:Page;
    readonly newInvoiceButton: Locator;
    readonly invoiceForm: Locator;
    readonly invoiceTitle: Locator;
    readonly editInvoiceTitle: Locator;
    readonly invoiceNumberInput: Locator;
    readonly totalInput: Locator;
    readonly invoiceDateInput: Locator;
    readonly stateSelect: Locator;
    readonly createInvoiceButton: Locator;
    readonly updateInvoiceButton: Locator;
    readonly invoiceNumberFilterInput: Locator;
    readonly invoiceFilters: Locator;
    readonly searchFilterButton: Locator;
    readonly clearFiltersButton: Locator;
    readonly invoicesTable: Locator;
    
    constructor(page:Page){
        this.page = page;
        this.newInvoiceButton = page.getByRole('button', { name: /nueva factura/i });
        this.invoiceForm = page.locator('app-invoice-form'); //Contenedor padre de Crear/editar factura
        this.invoiceTitle = page.getByRole('heading', {name: /crear nueva factura/i,});
        this.invoiceNumberInput = this.invoiceForm.locator('#invoiceNumber');
        this.totalInput = this.invoiceForm.locator('#total');
        this.invoiceDateInput = this.invoiceForm.locator('#invoiceDate');
        this.stateSelect = this.invoiceForm.locator('#status');
        this.createInvoiceButton = this.invoiceForm.getByRole('button', {name: /crear factura/i,});
        this.updateInvoiceButton = this.invoiceForm.getByRole('button', {name: /actualizar factura/i,});
        this.invoiceFilters = page.locator('app-filter-form'); //Contenedor padre de filters
        this.invoiceNumberFilterInput = this.invoiceFilters.locator('#invoiceName');
        this.searchFilterButton = this.invoiceFilters.getByRole('button', { name: "Buscar"});
        this.clearFiltersButton = this.invoiceFilters.getByRole("button", {name: "Limpiar Filtros"}); //LIMPIAR FILTRO
        this.invoicesTable = page.locator('.table.table-zebra'); //Contenedor tabla
        this.editInvoiceTitle = page.getByRole('heading', { name: 'Editar Factura' });
        

    }


    async createNewInvoice(invoiceNumber:string, total: string, state:string): Promise<void>{
        await this.newInvoiceButton.click();
        await expect(this.invoiceTitle).toBeVisible();
        await this.invoiceNumberInput.fill(invoiceNumber);
        await this.totalInput.fill(total);
        await expect(this.invoiceDateInput).not.toHaveValue('');
        await this.stateSelect.selectOption({ label: state });
        await this.createInvoiceButton.click();
        await expect(this.invoiceTitle).not.toBeVisible();

    }

    async searchInvoiceByNumber(invoiceNumber:string): Promise<void> {
        await this.invoiceNumberFilterInput.clear();
        await this.invoiceNumberFilterInput.fill(invoiceNumber);
        await this.searchFilterButton.click();
    }

    getInvoiceRowByNumber(invoiceNumber: string): Locator  {
        return this.invoicesTable.locator("tbody tr").filter({
            hasText: invoiceNumber,
        })
    }

    async validateInvoiceVisible(invoiceNumber:string): Promise<void> {
        const invoiceRow = this.getInvoiceRowByNumber(invoiceNumber);
        await expect(invoiceRow).toHaveCount(1);
        await expect(invoiceRow).toBeVisible();

    }

    async validateInvoiceNotVisible(invoiceNumber: string): Promise<void> {
        const invoiceRow = this.getInvoiceRowByNumber(invoiceNumber);

        await expect(invoiceRow).not.toBeVisible();
    }

    async clickEditInvoice(invoiceNumber: string): Promise<void> {
        const invoiceRow = this.getInvoiceRowByNumber(invoiceNumber);

        await expect(invoiceRow).toBeVisible();

        await invoiceRow.getByRole('button', {name: "Editar factura"}).click();

        await expect(this.editInvoiceTitle).toBeVisible();
        }
        
    async clickDeleteInvoice(invoiceNumber: string) {
        const invoiceRow = this.getInvoiceRowByNumber(invoiceNumber);

        await expect(invoiceRow).toBeVisible();

        await invoiceRow.getByRole('button', {name: "Eliminar factura"}).click();
        }   
    

    async editInvoice(currentInvoiceNumber:string, newInvoiceNumber: string, newTotal: string, newState:string): Promise<void>{
        await this.clickEditInvoice(currentInvoiceNumber);
        await this.invoiceNumberInput.clear();
        await this.invoiceNumberInput.fill(newInvoiceNumber);
        await this.totalInput.clear();
        await this.totalInput.fill(newTotal);
        await this.stateSelect.selectOption({ label: newState });
        await this.updateInvoiceButton.click();
        await expect(this.editInvoiceTitle).not.toBeVisible();

    }

    async deleteInvoice(invoiceNumber: string): Promise<void>{
        await this.page.once("dialog", dialog => {dialog.accept()});
        await this.clickDeleteInvoice(invoiceNumber);
        await this.validateInvoiceNotVisible(invoiceNumber);

    }

    async clearFilters(){

        await this.clearFiltersButton.click();
    }
};