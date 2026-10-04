import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pageObjects/login.page';
import { StorefrontPage } from '../../pageObjects/storefront.page';
import {
  emailAddressWithoutBelongingPassword,
  invalidEmailAddresses,
} from '../../testData/login/invalidEmailAddresses';

const email = process.env.ALDI_EMAIL;
const password = process.env.ALDI_PASSWORD;
const invalidPassword = process.env.ALDI_INVALID_PASSWORD;
const loginSkipReason =
  'Set the required Aldi credentials in .env to run this test.';

test.describe('Aldi login', () => {
  test('signs in with valid credentials', async ({ page }) => {
    test.setTimeout(60_000);
    test.skip(!email || !password, loginSkipReason);

    const loginPage = new LoginPage(page);
    const storefrontPage = new StorefrontPage(page);
    await storefrontPage.openLogin();
    await storefrontPage.expectLoginFormVisible(loginPage.emailInput);
    await loginPage.submitCredentials(email!, password!);
    await loginPage.acceptConsentIfRequired();

    await expect(storefrontPage.accountMenuButton).toBeVisible({
      timeout: 30_000,
    });
    await storefrontPage.open();
    await expect(page).toHaveURL(storefrontPage.urlPattern);
    await expect(storefrontPage.accountMenuButton).toBeVisible();
  });

  test('shows errors for an invalid password and mismatched email input', async ({ page }) => {
    test.skip(
      !email ||
        !password ||
        !invalidPassword ||
        invalidPassword === password,
      loginSkipReason,
    );

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.submitCredentials(email!, invalidPassword!);

    await expect(loginPage.failureMessage).toContainText(
      loginPage.invalidCredentialsMessage,
    );
    await expect(loginPage.passwordResetLink).toBeVisible();
    await expect(loginPage.registrationLink).toBeVisible();

    await loginPage.open();
    await loginPage.submitCredentials(
      emailAddressWithoutBelongingPassword,
      password!,
    );
    await expect(loginPage.failureMessage).toContainText(
      loginPage.invalidCredentialsMessage,
    );
  });

  test('shows required and format validation for invalid email values and no password value', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await expect(loginPage.emailInput).toHaveValue('');

    await loginPage.blurEmailWithTab();
    await expect(loginPage.emailHelpMessage).toContainText('Complete this field.');

    for (const invalidEmailAddress of invalidEmailAddresses) {
      await loginPage.blurEmailWithTab(invalidEmailAddress);
      await expect(loginPage.emailHelpMessage).toContainText(
        loginPage.invalidEmailMessage,
      );
    }

    await loginPage.blurPasswordWithTab();
    await expect(loginPage.passwordHelpMessage).toContainText('Complete this field.');
  });
});