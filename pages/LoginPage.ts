import {Page, Locator, expect } from '@playwright/test';

export class LoginPage{
    readonly page:Page;
    readonly codeAccessInput: Locator;
    readonly validateCodeButton: Locator;
    readonly invoicesSystemTitle: Locator;
    readonly logoutButton: Locator;

    constructor(page:Page){
        this.page = page;
        this.codeAccessInput = page.getByPlaceholder("Código de acceso");
        this.validateCodeButton = page.getByRole('button', { name: /validar código/i });
        this.invoicesSystemTitle = page.getByText('Sistema de Facturas');
        this.logoutButton = page.getByRole('button', { name: /Cerrar Sesión/i });
    }

    async goTo(): Promise<void> {
        await this.page.goto('/');
    }

    async login(accessCode:string): Promise<void> {
        await this.codeAccessInput.fill(accessCode);
        await this.validateCodeButton.click();
    }
    
    async expectLoginSuccessful(): Promise<void> {
        await expect(this.invoicesSystemTitle).toBeVisible();

    }

    async logout(): Promise<void> {
        await this.page.once("dialog", dialog => {dialog.accept()})
        await this.logoutButton.click()
    }

    async expectLogoutSuccess(): Promise<void> {
        await expect(this.codeAccessInput).toBeVisible();

    }
}