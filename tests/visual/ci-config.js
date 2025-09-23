/**
 * CI/CD configuration for visual regression testing
 */

export const ciConfig = {
  // Baseline management
  baseline: {
    // Directory to store baseline screenshots
    baselineDir: 'tests/visual/baselines',
    
    // Directory for test results
    resultsDir: 'test-results/visual',
    
    // Directory for diff images
    diffDir: 'test-results/visual/diffs',
    
    // Update baselines on CI
    updateBaselines: process.env.UPDATE_BASELINES === 'true',
    
    // Fail on missing baselines
    failOnMissingBaselines: process.env.CI === 'true'
  },

  // Screenshot comparison settings
  comparison: {
    // Threshold for pixel differences (0-1)
    threshold: parseFloat(process.env.VISUAL_THRESHOLD) || 0.2,
    
    // Maximum number of different pixels allowed
    maxDiffPixels: parseInt(process.env.MAX_DIFF_PIXELS) || 100,
    
    // Animation handling
    animations: 'disabled',
    
    // Clip screenshots to visible area
    clip: null,
    
    // Full page screenshots
    fullPage: true
  },

  // Browser configuration for CI
  browsers: {
    // Primary browser for baseline generation
    primary: 'chromium',
    
    // Browsers to test against
    test: process.env.CI ? ['chromium'] : ['chromium', 'firefox', 'webkit'],
    
    // Device emulation
    devices: [
      'Desktop Chrome',
      'iPad',
      'iPhone 12',
      'Pixel 5'
    ]
  },

  // Performance settings
  performance: {
    // Parallel test execution
    workers: process.env.CI ? 1 : 2,
    
    // Test timeout
    timeout: 30000,
    
    // Retry failed tests
    retries: process.env.CI ? 2 : 0,
    
    // Wait for network idle
    waitForNetworkIdle: true,
    
    // Wait for fonts to load
    waitForFonts: true
  },

  // Reporting configuration
  reporting: {
    // Generate HTML report
    html: true,
    
    // Generate JSON report
    json: true,
    
    // Report directory
    outputDir: 'test-results/visual-reports',
    
    // Include screenshots in report
    includeScreenshots: true,
    
    // Include diff images in report
    includeDiffs: true
  }
};

/**
 * Get configuration for current environment
 */
export function getConfig() {
  const isCI = process.env.CI === 'true';
  const isDev = process.env.NODE_ENV === 'development';
  
  return {
    ...ciConfig,
    
    // Environment-specific overrides
    ...(isCI && {
      browsers: {
        ...ciConfig.browsers,
        test: ['chromium'] // Only test Chromium in CI for speed
      },
      performance: {
        ...ciConfig.performance,
        workers: 1,
        retries: 2
      }
    }),
    
    ...(isDev && {
      comparison: {
        ...ciConfig.comparison,
        threshold: 0.3, // More lenient in development
        maxDiffPixels: 200
      }
    })
  };
}

/**
 * Setup test environment
 */
export async function setupTestEnvironment(page) {
  // Set consistent user agent
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Playwright-Visual-Testing/1.0'
  });
  
  // Disable animations globally
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  });
  
  // Set consistent timezone
  await page.emulateTimezone('UTC');
  
  // Set consistent locale
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9'
  });
}

/**
 * Cleanup after tests
 */
export async function cleanupTestEnvironment() {
  // Clean up temporary files
  const fs = await import('fs/promises');
  const path = await import('path');
  
  try {
    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    await fs.rmdir(tempDir, { recursive: true });
  } catch (error) {
    // Ignore cleanup errors
    console.warn('Cleanup warning:', error.message);
  }
}