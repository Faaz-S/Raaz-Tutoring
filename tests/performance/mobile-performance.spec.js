import { test, expect } from '@playwright/test';
import { 
  deviceConfigs, 
  performanceBudgets, 
  runLighthouseAudit,
  extractCoreWebVitals,
  checkPerformanceBudget,
  generatePerformanceReport,
  savePerformanceResults
} from './utils/performance-helper.js';

test.describe('Mobile Performance Tests', () => {
  const baseUrl = 'http://localhost:4173';
  
  test('homepage meets mobile performance budget', async () => {
    const deviceConfig = deviceConfigs.mobile;
    const budget = performanceBudgets.mobile;
    
    // Run Lighthouse audit
    const auditResult = await runLighthouseAudit(baseUrl, deviceConfig);
    
    expect(auditResult.success).toBe(true);
    
    // Extract metrics
    const metrics = extractCoreWebVitals(auditResult.result);
    
    // Check against budget
    const budgetCheck = checkPerformanceBudget(metrics, budget);
    
    // Log results for debugging
    console.log('Mobile Performance Metrics:', metrics);
    console.log('Budget Check:', budgetCheck.summary);
    
    // Save detailed results
    await savePerformanceResults({
      device: 'mobile',
      url: baseUrl,
      metrics,
      budgetCheck,
      timestamp: new Date().toISOString()
    }, `mobile-performance-${Date.now()}.json`);
    
    // Assert that performance budget is met
    if (!budgetCheck.passed) {
      const failureMessages = budgetCheck.failures.map(f => 
        `${f.metric}: ${f.value} (budget: ${f.budget})`
      ).join(', ');
      
      throw new Error(`Mobile performance budget failed: ${failureMessages}`);
    }
    
    expect(budgetCheck.passed).toBe(true);
  });

  test('mobile Core Web Vitals meet thresholds', async ({ page }) => {
    // Navigate to homepage
    await page.goto(baseUrl);
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Measure Core Web Vitals using browser APIs
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // Measure FCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            vitals.fcp = fcpEntry.startTime;
          }
        }).observe({ entryTypes: ['paint'] });
        
        // Measure LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Measure CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Wait for measurements to complete
        setTimeout(() => {
          resolve(vitals);
        }, 3000);
      });
    });
    
    console.log('Browser-measured Web Vitals:', webVitals);
    
    // Check thresholds
    if (webVitals.fcp) {
      expect(webVitals.fcp).toBeLessThan(2000); // FCP < 2s
    }
    
    if (webVitals.lcp) {
      expect(webVitals.lcp).toBeLessThan(3000); // LCP < 3s
    }
    
    if (webVitals.cls !== undefined) {
      expect(webVitals.cls).toBeLessThan(0.1); // CLS < 0.1
    }
  });

  test('mobile page load performance under slow network', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', async (route) => {
      // Add delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    // Emulate slow 3G
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 500 * 1024 / 8, // 500 Kbps
      uploadThroughput: 500 * 1024 / 8,
      latency: 400
    });
    
    const startTime = Date.now();
    
    // Navigate and wait for load
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time on slow network: ${loadTime}ms`);
    
    // Should load within reasonable time even on slow network
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
  });

  test('mobile resource optimization', async ({ page }) => {
    // Track network requests
    const requests = [];
    const responses = [];
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
        size: response.headers()['content-length'] || 0
      });
    });
    
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Analyze requests
    const imageRequests = requests.filter(r => r.resourceType === 'image');
    const jsRequests = requests.filter(r => r.resourceType === 'script');
    const cssRequests = requests.filter(r => r.resourceType === 'stylesheet');
    
    console.log(`Resource requests - Images: ${imageRequests.length}, JS: ${jsRequests.length}, CSS: ${cssRequests.length}`);
    
    // Check for modern image formats
    const modernImageFormats = imageRequests.filter(r => 
      r.url.includes('.webp') || r.url.includes('.avif')
    );
    
    // Should use modern image formats for better performance
    if (imageRequests.length > 0) {
      const modernFormatRatio = modernImageFormats.length / imageRequests.length;
      console.log(`Modern image format usage: ${(modernFormatRatio * 100).toFixed(1)}%`);
    }
    
    // Check for compression
    const compressedResponses = responses.filter(r => 
      r.headers['content-encoding'] === 'gzip' || 
      r.headers['content-encoding'] === 'br'
    );
    
    const compressionRatio = compressedResponses.length / responses.length;
    console.log(`Compression usage: ${(compressionRatio * 100).toFixed(1)}%`);
    
    // Should have reasonable compression
    expect(compressionRatio).toBeGreaterThan(0.5); // At least 50% of responses compressed
  });

  test('mobile JavaScript bundle size optimization', async ({ page }) => {
    const jsResources = [];
    
    page.on('response', async (response) => {
      if (response.url().endsWith('.js') && response.status() === 200) {
        try {
          const buffer = await response.body();
          jsResources.push({
            url: response.url(),
            size: buffer.length,
            compressed: response.headers()['content-encoding'] === 'gzip' || 
                       response.headers()['content-encoding'] === 'br'
          });
        } catch (error) {
          // Ignore errors reading response body
        }
      }
    });
    
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    const totalJSSize = jsResources.reduce((sum, resource) => sum + resource.size, 0);
    const totalJSSizeKB = Math.round(totalJSSize / 1024);
    
    console.log(`Total JavaScript size: ${totalJSSizeKB}KB`);
    console.log('JavaScript resources:', jsResources.map(r => ({
      url: r.url.split('/').pop(),
      sizeKB: Math.round(r.size / 1024),
      compressed: r.compressed
    })));
    
    // Mobile JS bundle should be reasonable size
    expect(totalJSSizeKB).toBeLessThan(500); // Less than 500KB total JS
    
    // Main bundle should be under reasonable size
    const mainBundle = jsResources.find(r => r.url.includes('index') || r.url.includes('main'));
    if (mainBundle) {
      const mainBundleSizeKB = Math.round(mainBundle.size / 1024);
      console.log(`Main bundle size: ${mainBundleSizeKB}KB`);
      expect(mainBundleSizeKB).toBeLessThan(200); // Main bundle under 200KB
    }
  });
});