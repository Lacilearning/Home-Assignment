import { expect, type Locator, type Page } from '@playwright/test';

export class StorefrontPage {
  readonly accountMenuButton: Locator;
  readonly rejectCookiesButton: Locator;
  readonly loginNowLink: Locator;

  readonly url = 'https://www.aldi.us/store/aldi/storefront';
  readonly urlPattern =
    /^https:\/\/www\.aldi\.us\/store\/aldi\/storefront\/?(?:[?#].*)?$/i;

  constructor(private readonly page: Page) {
    this.accountMenuButton = page.getByRole('button', {
      name: 'Account Menu',
      exact: true,
    });
    this.rejectCookiesButton = page.getByRole('button', {
      name: /reject all non-essential/i,
    });
    this.loginNowLink = page.getByText('Login now', { exact: true });
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  async openLogin(): Promise<void> {
    await this.open();

    if (await this.rejectCookiesButton.isVisible()) {
      await this.rejectCookiesButton.click();
    }

    await this.loginNowLink.click();
  }

  async expectLoginFormVisible(emailInput: Locator): Promise<void> {
    await expect(emailInput).toBeVisible();
  }
}