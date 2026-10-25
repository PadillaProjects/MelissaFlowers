import { test, expect } from '@playwright/test';

const ARTIFACTS_DIR = '/Users/isaacpadilla/.gemini/antigravity-ide/brain/e622f691-2595-4dd8-aa69-45c03c52a1ba';

test.describe('Admin Dashboard Collapsible Cards & Reordering Audit', () => {
  test('Desktop Audit (1280x800) - Collapsed & Category Reorder', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/#/admin', { waitUntil: 'networkidle' });

    // Fill credentials
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'Test12345');
    await page.click('button[type="submit"]');

    // Wait for authenticated dashboard navbar
    await expect(page.locator('.admin-navbar')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2500);

    // Scroll to collection section
    const collectionSection = page.locator('.admin-collection-section');
    await collectionSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // 1. Screenshot Collapsed Collection Section (Desktop)
    await collectionSection.screenshot({
      path: `${ARTIFACTS_DIR}/admin_cards_collapsed_desktop.png`
    });

    // 2. Select a category to activate reordering mode
    const categorySelect = page.locator('.admin-filter-select');
    await categorySelect.selectOption({ label: 'Arreglos Florales' });
    await page.waitForTimeout(1000);

    // Screenshot Category Reorder Mode (Desktop)
    await collectionSection.screenshot({
      path: `${ARTIFACTS_DIR}/admin_cards_reorder_mode_desktop.png`
    });

    // 3. Expand the first card
    const firstCardHeader = page.locator('.admin-item-card-header').first();
    await firstCardHeader.click();
    await page.waitForTimeout(600);

    // Screenshot Expanded First Card (Desktop)
    await collectionSection.screenshot({
      path: `${ARTIFACTS_DIR}/admin_card_expanded_desktop.png`
    });
  });

  test('Mobile Audit (390x844) - Collapsed & Category Reorder', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/#/admin', { waitUntil: 'networkidle' });

    // Fill credentials
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'Test12345');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page.locator('.admin-navbar')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2500);

    const collectionSection = page.locator('.admin-collection-section');
    await collectionSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // 1. Screenshot Collapsed Cards View (Mobile)
    await collectionSection.screenshot({
      path: `${ARTIFACTS_DIR}/admin_cards_collapsed_mobile.png`
    });

    // 2. Select category
    const categorySelect = page.locator('.admin-filter-select');
    await categorySelect.selectOption({ label: 'Arreglos Florales' });
    await page.waitForTimeout(1000);

    // Screenshot Category Reorder View (Mobile)
    await collectionSection.screenshot({
      path: `${ARTIFACTS_DIR}/admin_cards_reorder_mode_mobile.png`
    });

    // 3. Expand first card
    const firstCardHeader = page.locator('.admin-item-card-header').first();
    await firstCardHeader.click();
    await page.waitForTimeout(600);

    // Screenshot Expanded Card (Mobile)
    await collectionSection.screenshot({
      path: `${ARTIFACTS_DIR}/admin_card_expanded_mobile.png`
    });
  });
});
