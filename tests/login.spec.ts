import {test} from '@playwright/test';
import {LoginPage} from '../pages/LoginPage';

const accessCode = process.env.ACCESS_CODE ?? '';

test.describe('Login', () =>{
    test('should login successfully', async({page}) => {
        const loginPage = new LoginPage(page);
        await loginPage.goTo();
        await loginPage.login(accessCode);
        await loginPage.expectLoginSuccessful();
    });
    test('should lougout successfully', async ({page}) =>{
        const loginPage = new LoginPage(page);
        await loginPage.goTo();
        await loginPage.login(accessCode);
        await loginPage.expectLoginSuccessful();
        await loginPage.logout();
        await loginPage.expectLogoutSuccess();
    })


})
