import { test, expect } from '@playwright/test';

const SLUG = 'meetup-006-gpus-ai-agents';

test.describe('Event artifacts', () => {
  test('speaker banner renders at exact size with metadata content', async ({ page }) => {
    await page.goto(`/kit/${SLUG}/raw/speaker-1`);
    const frame = page.locator('[data-artifact-frame]');
    await expect(frame).toBeVisible();

    const box = await frame.boundingBox();
    expect(Math.round(box.width)).toBe(1280);
    expect(Math.round(box.height)).toBe(720);

    await expect(frame).toContainText('Meetup #6');
    await expect(frame).toContainText('Andrey Adamovich');
    await expect(frame).toContainText('Secret Agents: Identity for AI Workloads');
  });

  test('unknown variant reports an error marker', async ({ page }) => {
    await page.goto(`/kit/${SLUG}/raw/does-not-exist`);
    await expect(page.locator('[data-artifact-error]')).toBeVisible();
  });

  test('manifest exposes every event and the image matrix', async ({ page }) => {
    await page.goto('/kit/manifest');
    const json = JSON.parse(await page.locator('[data-manifest]').textContent());
    expect(json.events.length).toBe(6);
    expect(json.images.length).toBeGreaterThan(40);
    // brand (OCG) strips are present
    expect(json.images.some((a) => a.variant === 'ocg-banner-desktop')).toBe(true);
    // each event has a canonical URL + announcement copy
    for (const e of json.events) {
      expect(e.url).toContain('/events/');
      expect(e.social.announcement.length).toBeGreaterThan(20);
    }
  });

  test('kit index lists events and platform assets', async ({ page }) => {
    await page.goto('/kit');
    await expect(page.getByRole('heading', { name: 'Organizer kits' })).toBeVisible();
    await expect(page.getByText('Platform assets')).toBeVisible();
    await expect(page.locator(`a[href="/kit/${SLUG}"]`)).toBeVisible();
  });

  test('event kit page shows banners and copyable social text', async ({ page }) => {
    await page.goto(`/kit/${SLUG}`);
    await expect(page.getByRole('heading', { name: /Organizer kit/ })).toBeVisible();
    await expect(page.getByText('Banners')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Announcement' })).toBeVisible();
    await expect(page.getByText('GPUs and AI Agents', { exact: false }).first()).toBeVisible();
  });
});
