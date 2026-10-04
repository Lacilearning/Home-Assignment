import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly acceptConsentButton: Locator;
  readonly emailHelpMessage: Locator;
  readonly passwordHelpMessage: Locator;
  readonly failureMessage: Locator;
  readonly passwordResetLink: Locator;
  readonly registrationLink: Locator;

  readonly invalidCredentialsMessage =
    'Your email and password do not match or you may not be registered with this email address. Please try again';
  readonly invalidEmailMessage = 'Please enter a valid email address';
  readonly postLoginRedirectPattern =
    /\/(?:s\/details|apex\/CIAM_SocialConsentScreen|store\/aldi\/storefront)(?:[?#]|$)/;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email Address');
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.submitButton = page
      .getByRole('button', { name: 'Log In', exact: true })
      .last();
    this.acceptConsentButton = page.getByRole('button', { name: /accept/i });
    this.emailHelpMessage = page.locator(
      '[data-name="email"][data-help-message][part="help-text"]',
    );
    this.passwordHelpMessage = page.locator(
      '[data-name="passw"][data-help-message][part="help-text"]',
    );
    this.failureMessage = page.locator('[id^="failure_err_msg"]');
    this.passwordResetLink = page.getByRole('link', {
      name: /forgot your password|reset your password/i,
    });
    this.registrationLink = page.getByRole('link', {
      name: "Don't have an account? Register here!",
    });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async submitCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async blurEmailWithTab(value = ''): Promise<void> {
    await this.emailInput.fill(value);
    await this.emailInput.press('Tab');
  }

  async blurPasswordWithTab(value = ''): Promise<void> {
    await this.passwordInput.fill(value);
    await this.passwordInput.press('Tab');
  }

  async acceptConsentIfRequired(): Promise<void> {
    await expect(this.page).toHaveURL(this.postLoginRedirectPattern);

    if (new URL(this.page.url()).pathname.endsWith('/CIAM_SocialConsentScreen')) {
      if (await this.acceptConsentButton.isVisible()) {
        await this.acceptConsentButton.click();
      }
    }
  }
}