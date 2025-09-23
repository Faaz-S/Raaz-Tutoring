import { test, expect } from '@playwright/test';
import { 
  waitForPageStable, 
  hideDynamicContent, 
  setResponsiveViewport,
  breakpoints 
} from './utils/screenshot-helper.js';

test.describe('Cross-Browser Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageStable(page);
  });

  test('homepage renders consistently across browsers', async ({ page, browserName }) => {
    await hideDynamicContent(page);
    
    // Test at key breakpoints for each browser
    const testBreakpoints = {
      mobile: breakpoints.mobile,
      tablet: breakpoints.tablet,
      desktop: breakpoints.desktop
    };

    for (const [breakpointName, viewport] of Object.entries(testBreakpoints)) {
      await setResponsiveViewport(page, viewport);
      await waitForPageStable(page);

      await expect(page).toHaveScreenshot(`homepage-${browserName}-${breakpointName}.png`, {
        fullPage: true,
        animations: 'disabled',
        threshold: 0.3, // Allow for slight browser differences
        maxDiffPixels: 500
      });
    }
  });

  test('navigation consistency across browsers', async ({ page, browserName }) => {
    const navSelector = 'nav, [data-testid="navbar"], .navbar';
    
    await page.locator(navSelector).first().waitFor({ state: 'visible' });
    
    // Test mobile navigation
    await setResponsiveViewport(page, breakpoints.mobile);
    await waitForPageStable(page);
    
    const navBounds = await page.locator(navSelector).first().boundingBox();
    if (navBounds) {
      await expect(page).toHaveScreenshot(`navigation-mobile-${browserName}.png`, {
        clip: navBounds,
        animations: 'disabled',
        threshold: 0.2
      });
    }

    // Test desktop navigation
    await setResponsiveViewport(page, breakpoints.desktop);
    await waitForPageStable(page);
    
    const desktopNavBounds = await page.locator(navSelector).first().boundingBox();
    if (desktopNavBounds) {
      await expect(page).toHaveScreenshot(`navigation-desktop-${browserName}.png`, {
        clip: desktopNavBounds,
        animations: 'disabled',
        threshold: 0.2
      });
    }
  });

  test('form rendering across browsers', async ({ page, browserName }) => {
    const forms = page.locator('form');
    const formCount = await forms.count();

    if (formCount > 0) {
      const form = forms.first();
      await form.scrollIntoViewIfNeeded();
      await waitForPageStable(page);

      // Test form at mobile and desktop
      const testBreakpoints = {
        mobile: breakpoints.mobile,
        desktop: breakpoints.desktop
      };

      for (const [breakpointName, viewport] of Object.entries(testBreakpoints)) {
        await setResponsiveViewport(page, viewport);
        await waitForPageStable(page);

        const formBounds = await form.boundingBox();
        if (formBounds) {
          await expect(page).toHaveScreenshot(`form-${browserName}-${breakpointName}.png`, {
            clip: formBounds,
            animations: 'disabled',
            threshold: 0.3 // Forms can vary more between browsers
          });
        }
      }
    }
  });

  test('typography rendering consistency', async ({ page, browserName }) => {
    // Test main heading
    const h1 = page.locator('h1').first();
    
    if (await h1.isVisible()) {
      await h1.scrollIntoViewIfNeeded();
      await waitForPageStable(page);

      const testBreakpoints = {
        mobile: breakpoints.mobile,
        desktop: breakpoints.desktop
      };

      for (const [breakpointName, viewport] of Object.entries(testBreakpoints)) {
        await setResponsiveViewport(page, viewport);
        await waitForPageStable(page);

        const h1Bounds = await h1.boundingBox();
        if (h1Bounds) {
          await expect(page).toHaveScreenshot(`typography-h1-${browserName}-${breakpointName}.png`, {
            clip: h1Bounds,
            animations: 'disabled',
            threshold: 0.4 // Typography can vary significantly between browsers
          });
        }
      }
    }
  });

  test('button styling consistency', async ({ page, browserName }) => {
    const buttons = page.locator('button, .btn, [role="button"]');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const button = buttons.first();
      
      if (await button.isVisible()) {
        await button.scrollIntoViewIfNeeded();
        await waitForPageStable(page);

        const testBreakpoints = {
          mobile: breakpoints.mobile,
          desktop: breakpoints.desktop
        };

        for (const [breakpointName, viewport] of Object.entries(testBreakpoints)) {
          await setResponsiveViewport(page, viewport);
          await waitForPageStable(page);

          const buttonBounds = await button.boundingBox();
          if (buttonBounds && buttonBounds.width > 0 && buttonBounds.height > 0) {
            await expect(page).toHaveScreenshot(`button-${browserName}-${breakpointName}.png`, {
              clip: buttonBounds,
              animations: 'disabled',
              threshold: 0.3
            });
          }
        }
      }
    }
  });
});