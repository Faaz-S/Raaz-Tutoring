import { test, expect } from '@playwright/test';
import { 
  waitForPageStable, 
  hideDynamicContent, 
  testResponsiveBreakpoints,
  setResponsiveViewport,
  breakpoints 
} from './utils/screenshot-helper.js';

test.describe('Component Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageStable(page);
  });

  test('responsive images scale correctly', async ({ page }) => {
    // Find all images on the page
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const image = images.nth(i);
        await image.scrollIntoViewIfNeeded();
        await waitForPageStable(page);

        // Test image at different breakpoints
        for (const [breakpointName, viewport] of Object.entries(breakpoints)) {
          await setResponsiveViewport(page, viewport);
          await waitForPageStable(page);

          const imageBounds = await image.boundingBox();
          if (imageBounds) {
            await expect(page).toHaveScreenshot(`image-${i}-${breakpointName}.png`, {
              clip: imageBounds,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('responsive video elements', async ({ page }) => {
    // Look for video elements
    const videos = page.locator('video');
    const videoCount = await videos.count();

    if (videoCount > 0) {
      const video = videos.first();
      await video.scrollIntoViewIfNeeded();
      await waitForPageStable(page);

      // Test video container at different breakpoints
      await testResponsiveBreakpoints(page, 'video-container', {
        hideDynamic: true,
        screenshotOptions: {
          clip: await video.boundingBox()
        }
      });
    }
  });

  test('form elements responsive behavior', async ({ page }) => {
    // Look for forms
    const forms = page.locator('form');
    const formCount = await forms.count();

    if (formCount > 0) {
      const form = forms.first();
      await form.scrollIntoViewIfNeeded();
      await waitForPageStable(page);

      // Test form at mobile and desktop breakpoints
      const testBreakpoints = {
        mobile: breakpoints.mobile,
        desktop: breakpoints.desktop
      };

      for (const [breakpointName, viewport] of Object.entries(testBreakpoints)) {
        await setResponsiveViewport(page, viewport);
        await waitForPageStable(page);

        const formBounds = await form.boundingBox();
        if (formBounds) {
          await expect(page).toHaveScreenshot(`form-${breakpointName}.png`, {
            clip: formBounds,
            animations: 'disabled'
          });
        }
      }
    }
  });

  test('button responsive sizing', async ({ page }) => {
    // Find all buttons
    const buttons = page.locator('button, .btn, [role="button"]');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Test first few buttons
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        
        if (await button.isVisible()) {
          await button.scrollIntoViewIfNeeded();
          await waitForPageStable(page);

          // Test at mobile and desktop
          const testBreakpoints = {
            mobile: breakpoints.mobile,
            desktop: breakpoints.desktop
          };

          for (const [breakpointName, viewport] of Object.entries(testBreakpoints)) {
            await setResponsiveViewport(page, viewport);
            await waitForPageStable(page);

            const buttonBounds = await button.boundingBox();
            if (buttonBounds && buttonBounds.width > 0 && buttonBounds.height > 0) {
              await expect(page).toHaveScreenshot(`button-${i}-${breakpointName}.png`, {
                clip: buttonBounds,
                animations: 'disabled'
              });
            }
          }
        }
      }
    }
  });

  test('typography responsive scaling', async ({ page }) => {
    // Test different heading levels
    const headingSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
    for (const selector of headingSelectors) {
      const headings = page.locator(selector);
      const count = await headings.count();
      
      if (count > 0) {
        const heading = headings.first();
        await heading.scrollIntoViewIfNeeded();
        await waitForPageStable(page);

        // Test typography at key breakpoints
        const testBreakpoints = {
          mobile: breakpoints.mobile,
          tablet: breakpoints.tablet,
          desktop: breakpoints.desktop
        };

        for (const [breakpointName, viewport] of Object.entries(testBreakpoints)) {
          await setResponsiveViewport(page, viewport);
          await waitForPageStable(page);

          const headingBounds = await heading.boundingBox();
          if (headingBounds) {
            await expect(page).toHaveScreenshot(`${selector}-${breakpointName}.png`, {
              clip: headingBounds,
              animations: 'disabled'
            });
          }
        }
      }
    }
  });

  test('grid layout responsive behavior', async ({ page }) => {
    // Look for grid containers
    const gridSelectors = [
      '.grid',
      '[style*="grid"]',
      '[class*="grid"]',
      '.flex',
      '[style*="flex"]'
    ];

    for (const selector of gridSelectors) {
      const grids = page.locator(selector);
      const count = await grids.count();
      
      if (count > 0) {
        const grid = grids.first();
        
        if (await grid.isVisible()) {
          await grid.scrollIntoViewIfNeeded();
          await waitForPageStable(page);

          const gridBounds = await grid.boundingBox();
          if (gridBounds && gridBounds.width > 100 && gridBounds.height > 50) {
            await testResponsiveBreakpoints(page, `grid-layout-${selector.replace(/[^a-zA-Z0-9]/g, '')}`, {
              hideDynamic: true,
              screenshotOptions: {
                clip: gridBounds
              }
            });
          }
        }
      }
    }
  });

  test('spacing and padding responsive behavior', async ({ page }) => {
    // Test main content containers for spacing
    const containerSelectors = [
      'main',
      '.container',
      '[class*="container"]',
      'section',
      'article'
    ];

    for (const selector of containerSelectors) {
      const containers = page.locator(selector);
      const count = await containers.count();
      
      if (count > 0) {
        const container = containers.first();
        
        if (await container.isVisible()) {
          await container.scrollIntoViewIfNeeded();
          await waitForPageStable(page);

          // Test spacing at mobile and desktop
          const testBreakpoints = {
            mobile: breakpoints.mobile,
            desktop: breakpoints.desktop
          };

          for (const [breakpointName, viewport] of Object.entries(testBreakpoints)) {
            await setResponsiveViewport(page, viewport);
            await waitForPageStable(page);

            const containerBounds = await container.boundingBox();
            if (containerBounds && containerBounds.width > 200) {
              await expect(page).toHaveScreenshot(`spacing-${selector.replace(/[^a-zA-Z0-9]/g, '')}-${breakpointName}.png`, {
                clip: containerBounds,
                animations: 'disabled'
              });
            }
          }
        }
      }
    }
  });
});