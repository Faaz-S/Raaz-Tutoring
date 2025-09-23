import { test, expect } from '@playwright/test';
import { 
  waitForPageStable, 
  hideDynamicContent, 
  testResponsiveBreakpoints,
  compareWithBaseline,
  testOrientationChange 
} from './utils/screenshot-helper.js';

test.describe('Homepage Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageStable(page);
  });

  test('homepage renders correctly across all breakpoints', async ({ page }) => {
    const results = await testResponsiveBreakpoints(page, 'homepage-full', {
      hideDynamic: true,
      screenshotOptions: {
        fullPage: true
      }
    });

    // Verify all breakpoints were tested successfully
    const breakpointNames = Object.keys(results);
    expect(breakpointNames.length).toBeGreaterThan(0);
    
    // Log results for debugging
    console.log('Homepage breakpoint test results:', results);
  });

  test('hero section responsive layout', async ({ page }) => {
    // Test hero section specifically at different breakpoints
    const heroSelector = '[data-testid="hero-section"], .hero-section, section:first-of-type';
    
    await page.locator(heroSelector).first().waitFor({ state: 'visible' });
    
    const results = await testResponsiveBreakpoints(page, 'hero-section', {
      hideDynamic: true,
      screenshotOptions: {
        clip: await page.locator(heroSelector).first().boundingBox()
      }
    });

    console.log('Hero section test results:', results);
  });

  test('navigation responsive behavior', async ({ page }) => {
    const navSelector = 'nav, [data-testid="navbar"], .navbar';
    
    await page.locator(navSelector).first().waitFor({ state: 'visible' });
    
    // Test navigation at mobile breakpoint (should show hamburger menu)
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForPageStable(page);
    
    await expect(page).toHaveScreenshot('navigation-mobile.png', {
      clip: await page.locator(navSelector).first().boundingBox(),
      animations: 'disabled'
    });

    // Test navigation at desktop breakpoint (should show full menu)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await waitForPageStable(page);
    
    await expect(page).toHaveScreenshot('navigation-desktop.png', {
      clip: await page.locator(navSelector).first().boundingBox(),
      animations: 'disabled'
    });
  });

  test('mobile menu interaction', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForPageStable(page);

    // Look for hamburger menu button
    const hamburgerSelectors = [
      '[data-testid="hamburger-menu"]',
      '.hamburger-menu',
      'button[aria-label*="menu"]',
      'button[aria-expanded]'
    ];

    let hamburgerButton = null;
    for (const selector of hamburgerSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        hamburgerButton = element;
        break;
      }
    }

    if (hamburgerButton) {
      // Test closed state
      await expect(page).toHaveScreenshot('mobile-menu-closed.png', {
        fullPage: true,
        animations: 'disabled'
      });

      // Click hamburger menu
      await hamburgerButton.click();
      await page.waitForTimeout(500); // Wait for animation

      // Test open state
      await expect(page).toHaveScreenshot('mobile-menu-open.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('orientation change handling', async ({ page }) => {
    const results = await testOrientationChange(page, 'homepage-orientation');
    
    // Verify both orientations were tested
    expect(results.portrait).toBeDefined();
    expect(results.landscape).toBeDefined();
    
    console.log('Orientation test results:', results);
  });

  test('footer responsive layout', async ({ page }) => {
    const footerSelector = 'footer, [data-testid="footer"], .footer';
    
    // Scroll to footer
    await page.locator(footerSelector).first().scrollIntoViewIfNeeded();
    await waitForPageStable(page);
    
    const results = await testResponsiveBreakpoints(page, 'footer-section', {
      hideDynamic: true,
      screenshotOptions: {
        clip: await page.locator(footerSelector).first().boundingBox()
      }
    });

    console.log('Footer test results:', results);
  });

  test('content sections responsive layout', async ({ page }) => {
    // Test main content sections
    const contentSelectors = [
      'main section',
      '[data-testid="intro-section"]',
      '[data-testid="faq-section"]',
      '.content-section'
    ];

    for (const selector of contentSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        const element = elements.first();
        await element.scrollIntoViewIfNeeded();
        await waitForPageStable(page);
        
        const sectionName = await element.getAttribute('data-testid') || 
                           await element.getAttribute('class') || 
                           'content-section';
        
        await testResponsiveBreakpoints(page, `section-${sectionName}`, {
          hideDynamic: true,
          screenshotOptions: {
            clip: await element.boundingBox()
          }
        });
      }
    }
  });
});