/**
 * Performance testing utilities for mobile and desktop
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

/**
 * Device configurations for performance testing
 */
export const deviceConfigs = {
  mobile: {
    name: 'Mobile',
    emulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4, // Slow 4G
      cpuSlowdownMultiplier: 4,
    },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  },
  
  tablet: {
    name: 'Tablet',
    emulation: {
      mobile: true,
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      disabled: false,
    },
    throttling: {
      rttMs: 100,
      throughputKbps: 5000, // Fast 4G
      cpuSlowdownMultiplier: 2,
    },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  },
  
  desktop: {
    name: 'Desktop',
    emulation: {
      mobile: false,
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240, // Fast connection
      cpuSlowdownMultiplier: 1,
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

/**
 * Performance budgets for different device categories
 */
export const performanceBudgets = {
  mobile: {
    'first-contentful-paint': 2000,
    'largest-contentful-paint': 3000,
    'cumulative-layout-shift': 0.1,
    'total-blocking-time': 300,
    'speed-index': 3000,
    'interactive': 4000,
    'performance-score': 80,
  },
  
  tablet: {
    'first-contentful-paint': 1500,
    'largest-contentful-paint': 2500,
    'cumulative-layout-shift': 0.1,
    'total-blocking-time': 200,
    'speed-index': 2500,
    'interactive': 3000,
    'performance-score': 85,
  },
  
  desktop: {
    'first-contentful-paint': 1000,
    'largest-contentful-paint': 2000,
    'cumulative-layout-shift': 0.1,
    'total-blocking-time': 150,
    'speed-index': 2000,
    'interactive': 2500,
    'performance-score': 90,
  }
};

/**
 * Run Lighthouse audit for a specific device configuration
 */
export async function runLighthouseAudit(url, deviceConfig, options = {}) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const lighthouseOptions = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices'],
    port: chrome.port,
    ...options
  };
  
  const lighthouseConfig = {
    extends: 'lighthouse:default',
    settings: {
      emulatedFormFactor: deviceConfig.emulation.mobile ? 'mobile' : 'desktop',
      throttling: deviceConfig.throttling,
      screenEmulation: deviceConfig.emulation,
      userAgent: deviceConfig.userAgent,
      ...options.settings
    }
  };
  
  try {
    const runnerResult = await lighthouse(url, lighthouseOptions, lighthouseConfig);
    await chrome.kill();
    
    return {
      success: true,
      result: runnerResult,
      deviceConfig: deviceConfig.name,
      url
    };
  } catch (error) {
    await chrome.kill();
    return {
      success: false,
      error: error.message,
      deviceConfig: deviceConfig.name,
      url
    };
  }
}

/**
 * Extract Core Web Vitals from Lighthouse result
 */
export function extractCoreWebVitals(lighthouseResult) {
  const audits = lighthouseResult.lhr.audits;
  
  return {
    'first-contentful-paint': audits['first-contentful-paint']?.numericValue || 0,
    'largest-contentful-paint': audits['largest-contentful-paint']?.numericValue || 0,
    'cumulative-layout-shift': audits['cumulative-layout-shift']?.numericValue || 0,
    'total-blocking-time': audits['total-blocking-time']?.numericValue || 0,
    'speed-index': audits['speed-index']?.numericValue || 0,
    'interactive': audits['interactive']?.numericValue || 0,
    'performance-score': lighthouseResult.lhr.categories.performance?.score * 100 || 0,
    'accessibility-score': lighthouseResult.lhr.categories.accessibility?.score * 100 || 0,
    'best-practices-score': lighthouseResult.lhr.categories['best-practices']?.score * 100 || 0,
  };
}

/**
 * Check if metrics meet performance budget
 */
export function checkPerformanceBudget(metrics, budget) {
  const results = {};
  const failures = [];
  
  for (const [metric, value] of Object.entries(metrics)) {
    const budgetValue = budget[metric];
    
    if (budgetValue !== undefined) {
      const passed = metric.includes('score') ? value >= budgetValue : value <= budgetValue;
      
      results[metric] = {
        value,
        budget: budgetValue,
        passed,
        difference: metric.includes('score') ? value - budgetValue : budgetValue - value
      };
      
      if (!passed) {
        failures.push({
          metric,
          value,
          budget: budgetValue,
          difference: results[metric].difference
        });
      }
    }
  }
  
  return {
    passed: failures.length === 0,
    results,
    failures,
    summary: {
      total: Object.keys(results).length,
      passed: Object.keys(results).length - failures.length,
      failed: failures.length
    }
  };
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: testResults.length,
      passed: testResults.filter(r => r.budgetCheck?.passed).length,
      failed: testResults.filter(r => !r.budgetCheck?.passed).length
    },
    devices: {},
    recommendations: []
  };
  
  // Group results by device
  for (const result of testResults) {
    if (!report.devices[result.deviceConfig]) {
      report.devices[result.deviceConfig] = {
        metrics: result.metrics,
        budgetCheck: result.budgetCheck,
        url: result.url
      };
    }
  }
  
  // Generate recommendations based on failures
  const allFailures = testResults.flatMap(r => r.budgetCheck?.failures || []);
  const failuresByMetric = {};
  
  for (const failure of allFailures) {
    if (!failuresByMetric[failure.metric]) {
      failuresByMetric[failure.metric] = [];
    }
    failuresByMetric[failure.metric].push(failure);
  }
  
  // Add recommendations for common failures
  for (const [metric, failures] of Object.entries(failuresByMetric)) {
    const recommendation = getRecommendationForMetric(metric, failures);
    if (recommendation) {
      report.recommendations.push(recommendation);
    }
  }
  
  return report;
}

/**
 * Get performance improvement recommendations
 */
function getRecommendationForMetric(metric, failures) {
  const recommendations = {
    'first-contentful-paint': {
      title: 'Improve First Contentful Paint',
      description: 'Optimize critical rendering path and reduce server response times',
      actions: [
        'Minimize critical resources',
        'Optimize images and fonts',
        'Use efficient caching strategies',
        'Minimize main thread work'
      ]
    },
    'largest-contentful-paint': {
      title: 'Improve Largest Contentful Paint',
      description: 'Optimize loading of the largest content element',
      actions: [
        'Optimize images and videos',
        'Preload important resources',
        'Reduce server response times',
        'Remove unused CSS and JavaScript'
      ]
    },
    'cumulative-layout-shift': {
      title: 'Reduce Layout Shifts',
      description: 'Prevent unexpected layout changes during page load',
      actions: [
        'Set explicit dimensions for images and videos',
        'Reserve space for dynamic content',
        'Avoid inserting content above existing content',
        'Use CSS aspect-ratio for responsive media'
      ]
    },
    'total-blocking-time': {
      title: 'Reduce Total Blocking Time',
      description: 'Minimize main thread blocking during page load',
      actions: [
        'Split large JavaScript bundles',
        'Remove unused JavaScript',
        'Optimize third-party scripts',
        'Use web workers for heavy computations'
      ]
    },
    'speed-index': {
      title: 'Improve Speed Index',
      description: 'Optimize visual loading progression',
      actions: [
        'Prioritize above-the-fold content',
        'Optimize critical rendering path',
        'Use progressive image loading',
        'Minimize render-blocking resources'
      ]
    }
  };
  
  const recommendation = recommendations[metric];
  if (recommendation) {
    return {
      ...recommendation,
      severity: failures.length > 1 ? 'high' : 'medium',
      affectedDevices: failures.length,
      averageImpact: failures.reduce((sum, f) => sum + Math.abs(f.difference), 0) / failures.length
    };
  }
  
  return null;
}

/**
 * Save performance results to file
 */
export async function savePerformanceResults(results, filename) {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const resultsDir = path.join(process.cwd(), 'test-results', 'performance');
  
  try {
    await fs.mkdir(resultsDir, { recursive: true });
    await fs.writeFile(
      path.join(resultsDir, filename),
      JSON.stringify(results, null, 2)
    );
    
    console.log(`Performance results saved to ${filename}`);
  } catch (error) {
    console.error('Failed to save performance results:', error.message);
  }
}