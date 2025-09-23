/**
 * Screenshot helper utilities for visual regression testing
 */

/**
 * Standard screenshot options for consistent visual testing
 */
export const screenshotOptions = {
  fullPage: true,
  animations: 'disabled',
  clip: null,
  mask: [],
  threshold: 0.2,
  maxDiffPixels: 100,
};

/**
 * Responsive breakpoints for testing
 */
export const breakpoints = {
  mobile: { width: 375, height: 667 },
  mobileLarge: { width: 414, height: 896 },
  tablet: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1366, height: 768 },
  desktopLarge: { width: 1920, height: 1080 },
  desktopXL: { width: 2560, height: 1440 },
};

/**
 * Wait for page to be fully loaded and stable
 */
export async function waitForPageStable(page, timeout = 5000) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // Wait for any animations to complete
  await page.waitForTimeout(500);
  
  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  
  // Wait for images to load
  await page.waitForFunction(() => {
    const images = Array.from(document.images);
    return images.every(img => img.complete);
  }, { timeout });
}

/**
 * Hide dynamic content that changes between test runs
 */
export async function hideDynamicContent(page) {
  // Hide elements that might have dynamic content
  const dynamicSelectors = [
    '[data-testid="current-time"]',
    '.loading-spinner',
    '.skeleton-loader',
    '[data-dynamic="true"]'
  ];
  
  for (const selector of dynamicSelectors) {
    await page.locator(selector).evaluateAll(elements => {
      elements.forEach(el => el.style.visibility = 'hidden');
    });
  }
}

/**
 * Set viewport and wait for responsive changes
 */
export async function setResponsiveViewport(page, viewport) {
  await page.setViewportSize(viewport);
  
  // Wait for responsive changes to take effect
  await page.waitForTimeout(300);
  
  // Trigger resize event
  await page.evaluate(() => {
    window.dispatchEvent(new Event('resize'));
  });
  
  // Wait for any responsive animations
  await page.waitForTimeout(200);
}

/**
 * Test page at multiple breakpoints
 */
export async function testResponsiveBreakpoints(page, testName, options = {}) {
  const results = {};
  
  for (const [breakpointName, viewport] of Object.entries(breakpoints)) {
    await setResponsiveViewport(page, viewport);
    await waitForPageStable(page);
    
    if (options.hideDynamic) {
      await hideDynamicContent(page);
    }
    
    const screenshotName = `${testName}-${breakpointName}`;
    
    try {
      await page.screenshot({
        ...screenshotOptions,
        path: `test-results/screenshots/${screenshotName}.png`,
        ...options.screenshotOptions
      });
      
      results[breakpointName] = { success: true, viewport };
    } catch (error) {
      results[breakpointName] = { success: false, error: error.message, viewport };
    }
  }
  
  return results;
}

/**
 * Compare screenshots with baseline
 */
export async function compareWithBaseline(page, testName, options = {}) {
  await waitForPageStable(page);
  
  if (options.hideDynamic) {
    await hideDynamicContent(page);
  }
  
  // Take screenshot and compare with baseline
  await expect(page).toHaveScreenshot(`${testName}.png`, {
    ...screenshotOptions,
    ...options
  });
}

/**
 * Test orientation changes
 */
export async function testOrientationChange(page, testName) {
  const orientations = [
    { width: 375, height: 667, name: 'portrait' },
    { width: 667, height: 375, name: 'landscape' }
  ];
  
  const results = {};
  
  for (const orientation of orientations) {
    await setResponsiveViewport(page, { 
      width: orientation.width, 
      height: orientation.height 
    });
    
    await waitForPageStable(page);
    
    const screenshotName = `${testName}-${orientation.name}`;
    
    try {
      await page.screenshot({
        ...screenshotOptions,
        path: `test-results/screenshots/${screenshotName}.png`
      });
      
      results[orientation.name] = { 
        success: true, 
        viewport: { width: orientation.width, height: orientation.height }
      };
    } catch (error) {
      results[orientation.name] = { 
        success: false, 
        error: error.message,
        viewport: { width: orientation.width, height: orientation.height }
      };
    }
  }
  
  return results;
}