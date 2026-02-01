import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('navigate through all pages', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Cloud Native/i);
    await page.waitForTimeout(1000);

    // Navigate to Events
    await page.click('a[href="/events"]');
    await expect(page.locator('h1')).toContainText(/Events|Pasākumi/);
    await page.waitForTimeout(1000);

    // Navigate to Speakers
    await page.click('a[href="/speakers"]');
    await expect(page.locator('h1')).toContainText(/Speakers|Runātāji/);
    await page.waitForTimeout(1000);

    // Navigate to Team
    await page.click('a[href="/team"]');
    await expect(page.locator('h1')).toContainText(/Team|Komanda/);
    await page.waitForTimeout(1000);

    // Navigate to Swag
    await page.click('a[href="/swag"]');
    await expect(page.locator('h1')).toContainText(/Swag|Suvenīri/);
    await page.waitForTimeout(1000);

    // Navigate to Sponsors
    await page.click('a[href="/sponsors"]');
    await expect(page.locator('h1')).toContainText(/Sponsor/);
    await page.waitForTimeout(1000);

    // Return to Home
    await page.click('a[href="/"]');
    await page.waitForTimeout(1000);
  });

  test('language switcher works', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Switch to Latvian
    await page.click('button:has-text("LV")');
    await page.waitForTimeout(1000);
    
    // Verify navigation changed to Latvian
    await expect(page.locator('nav')).toContainText('Pasākumi');
    
    // Navigate to check Latvian content
    await page.click('a[href="/events"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText('Pasākumi');

    // Switch back to English
    await page.click('button:has-text("EN")');
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText('Events');
  });

  test('mobile navigation works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Open mobile menu - wait for button to be visible
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await menuButton.waitFor({ state: 'visible', timeout: 10000 });
    await menuButton.click();
    await page.waitForTimeout(500);

    // Navigate using mobile menu - target links inside the mobile menu (block display)
    const eventsLink = page.locator('a[href="/events"].block');
    await eventsLink.waitFor({ state: 'visible', timeout: 5000 });
    await eventsLink.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText(/Events|Pasākumi/);

    // Open menu again and navigate
    await menuButton.click();
    await page.waitForTimeout(500);
    const teamLink = page.locator('a[href="/team"].block');
    await teamLink.waitFor({ state: 'visible', timeout: 5000 });
    await teamLink.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText(/Team|Komanda/);
  });
});
