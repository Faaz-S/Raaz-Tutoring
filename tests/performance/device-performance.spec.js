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

test.describe('Multi-Device Performance Tests', () => {
  const baseUrl = 'http://localhost:4173';
  
  test('performance comparison across device categories', async () => {
    const results = [];
    
    // Test each device configuration
    for (const [deviceName, deviceConfig] of Object.entries(deviceConfigs)) {
      const budget = performanceBudgets[deviceName];
      
      console.log(`Testing performance on ${deviceName}...`);
      
      // Run Lighthouse audit
      const auditResult = await runLighthouseAudit(baseUrl, deviceConfig);
      
      expect(auditResult.success).toBe(true);
      
      // Extract metrics
      const metrics = extractCoreWebVitals(auditResult.result);
      
      // Check against budget
      const budgetCheck = checkPerformanceBudget(metrics, budget);
      
      results.push({
        device: deviceName,
        deviceConfig: deviceConfig.name,
        url: baseUrl,
        metrics,
        budgetCheck,
        timestamp: new Date().toISOString()
      });
      
      console.log(`${deviceName} Performance:`, {
        'Performance Score': `${metrics['performance-score'].toFixed(1)}%`,
        'FCP': `${metrics['first-contentful-paint'].toFixed(0)}ms`,
        'LCP': `${metrics['largest-contentful-paint'].toFixed(0)}ms`,
        'CLS': metrics['cumulative-layout-shift'].toFixed(3),
        'Budget Passed': budgetCheck.passed
      });
    }
    
    // Generate comprehensive report
    const report = generatePerformanceReport(results);
    
    // Save results
    await savePerformanceResults(report, `device-performance-comparison-${Date.now()}.json`);
    
    // Log summary
    console.log('Performance Test Summary:', report.summary);
    console.log('Recommendations:', report.recommendations.map(r => r.title));
    
    // Assert that at least mobile performance meets budget
    const mobileResult = results.find(r => r.device === 'mobile');
    expect(mobileResult.budgetCheck.passed).toBe(true);
    
    // Desktop should perform better than mobile
    const desktopResult = results.find(r => r.device === 'desktop');
    if (desktopResult) {
      expect(desktopResult.metrics['performance-score']).toBeGreaterThan(
        mobileResult.metrics['performance-score']
      );
    }
  });

  test('responsive image performance across devices', async ({ page }) => {
    const deviceTests = [
      { name: 'mobile', viewport: { width: 375, height: 667 } },
      { name: 'tablet', viewport: { width: 768, height: 1024 } },
      { name: 'desktop', viewport: { width: 1366, height: 768 } }
    ];
    
    const imagePerformance = [];
    
    for (const device of deviceTests) {
      await page.setViewportSize(device.viewport);
      
      // Track image loading
      const imageRequests = [];
      page.on('response', async (response) => {
        if (response.request().resourceType() === 'image') {
          try {
            const buffer = await response.body();
            imageRequests.push({
              url: response.url(),
              size: buffer.length,
              status: response.status()
            });
          } catch (error) {
            // Ignore errors
          }
        }
      });
      
      const startTime = Date.now();
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      const totalImageSize = imageRequests.reduce((sum, img) => sum + img.size, 0);
      
      imagePerformance.push({
        device: device.name,
        viewport: device.viewport,
        imageCount: imageRequests.length,
        totalImageSizeKB: Math.round(totalImageSize / 1024),
        loadTimeMs: loadTime
      });
      
      console.log(`${device.name} image performance:`, {
        images: imageRequests.length,
        totalSizeKB: Math.round(totalImageSize / 1024),
        loadTimeMs: loadTime
      });
    }
    
    // Mobile should load fewer/smaller images than desktop
    const mobile = imagePerformance.find(d => d.device === 'mobile');
    const desktop = imagePerformance.find(d => d.device === 'desktop');
    
    if (mobile && desktop) {
      // Mobile should have reasonable image sizes
      expect(mobile.totalImageSizeKB).toBeLessThan(2000); // Less than 2MB of images
      
      // Mobile load time should be reasonable
      expect(mobile.loadTimeMs).toBeLessThan(5000); // Less than 5 seconds
    }
  });

  test('JavaScript execution performance across devices', async ({ page }) => {
    const deviceTests = [
      { name: 'mobile', viewport: { width: 375, height: 667 }, cpuThrottling: 4 },
      { name: 'tablet', viewport: { width: 768, height: 1024 }, cpuThrottling: 2 },
      { name: 'desktop', viewport: { width: 1366, height: 768 }, cpuThrottling: 1 }
    ];
    
    const jsPerformance = [];
    
    for (const device of deviceTests) {
      await page.setViewportSize(device.viewport);
      
      // Emulate CPU throttling
      const client = await page.context().newCDPSession(page);
      await client.send('Emulation.setCPUThrottlingRate', { 
        rate: device.cpuThrottling 
      });
      
      // Measure JavaScript execution time
      const startTime = Date.now();
      await page.goto(baseUrl);
      
      // Wait for React to hydrate and become interactive
      await page.waitForFunction(() => {
        return window.React !== undefined || 
               document.querySelector('[data-reactroot]') !== null ||
               document.querySelector('#root') !== null;
      }, { timeout: 10000 });
      
      const interactiveTime = Date.now() - startTime;
      
      // Measure main thread blocking time
      const mainThreadTime = await page.evaluate(() => {
        return new Promise((resolve) => {
          let totalBlockingTime = 0;
          
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                totalBlockingTime += entry.duration - 50;
              }
            }
            
            setTimeout(() => resolve(totalBlockingTime), 1000);
          }).observe({ entryTypes: ['longtask'] });
          
          // Fallback if no long tasks
          setTimeout(() => resolve(totalBlockingTime), 2000);
        });
      });
      
      jsPerformance.push({
        device: device.name,
        viewport: device.viewport,
        cpuThrottling: device.cpuThrottling,
        interactiveTimeMs: interactiveTime,
        mainThreadBlockingMs: mainThreadTime
      });
      
      console.log(`${device.name} JS performance:`, {
        interactiveMs: interactiveTime,
        blockingMs: mainThreadTime.toFixed(1)
      });
    }
    
    // Mobile should become interactive within reasonable time
    const mobile = jsPerformance.find(d => d.device === 'mobile');
    if (mobile) {
      expect(mobile.interactiveTimeMs).toBeLessThan(6000); // Interactive within 6s on mobile
      expect(mobile.mainThreadBlockingMs).toBeLessThan(500); // Less than 500ms blocking
    }
    
    // Desktop should be faster than mobile
    const desktop = jsPerformance.find(d => d.device === 'desktop');
    if (mobile && desktop) {
      expect(desktop.interactiveTimeMs).toBeLessThan(mobile.interactiveTimeMs);
    }
  });

  test('network resource optimization across devices', async ({ page }) => {
    const deviceTests = [
      { name: 'mobile', viewport: { width: 375, height: 667 } },
      { name: 'desktop', viewport: { width: 1366, height: 768 } }
    ];
    
    const networkPerformance = [];
    
    for (const device of deviceTests) {
      await page.setViewportSize(device.viewport);
      
      const resources = {
        total: 0,
        js: { count: 0, size: 0 },
        css: { count: 0, size: 0 },
        images: { count: 0, size: 0 },
        fonts: { count: 0, size: 0 },
        other: { count: 0, size: 0 }
      };
      
      page.on('response', async (response) => {
        if (response.status() === 200) {
          try {
            const buffer = await response.body();
            const size = buffer.length;
            const resourceType = response.request().resourceType();
            
            resources.total += size;
            
            switch (resourceType) {
              case 'script':
                resources.js.count++;
                resources.js.size += size;
                break;
              case 'stylesheet':
                resources.css.count++;
                resources.css.size += size;
                break;
              case 'image':
                resources.images.count++;
                resources.images.size += size;
                break;
              case 'font':
                resources.fonts.count++;
                resources.fonts.size += size;
                break;
              default:
                resources.other.count++;
                resources.other.size += size;
            }
          } catch (error) {
            // Ignore errors
          }
        }
      });
      
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      
      // Convert to KB
      const resourcesKB = {
        device: device.name,
        totalKB: Math.round(resources.total / 1024),
        js: {
          count: resources.js.count,
          sizeKB: Math.round(resources.js.size / 1024)
        },
        css: {
          count: resources.css.count,
          sizeKB: Math.round(resources.css.size / 1024)
        },
        images: {
          count: resources.images.count,
          sizeKB: Math.round(resources.images.size / 1024)
        },
        fonts: {
          count: resources.fonts.count,
          sizeKB: Math.round(resources.fonts.size / 1024)
        }
      };
      
      networkPerformance.push(resourcesKB);
      
      console.log(`${device.name} resource usage:`, resourcesKB);
    }
    
    // Save network performance data
    await savePerformanceResults(networkPerformance, `network-performance-${Date.now()}.json`);
    
    // Mobile should have reasonable resource usage
    const mobile = networkPerformance.find(d => d.device === 'mobile');
    if (mobile) {
      expect(mobile.totalKB).toBeLessThan(3000); // Total resources under 3MB
      expect(mobile.js.sizeKB).toBeLessThan(500); // JS under 500KB
      expect(mobile.css.sizeKB).toBeLessThan(100); // CSS under 100KB
    }
  });
});