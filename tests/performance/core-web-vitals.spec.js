import { test, expect } from '@playwright/test';
import { savePerformanceResults } from './utils/performance-helper.js';

test.describe('Core Web Vitals Monitoring', () => {
  const baseUrl = 'http://localhost:4173';
  
  test('measure and validate Core Web Vitals', async ({ page }) => {
    // Set mobile viewport for testing
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to page
    await page.goto(baseUrl);
    
    // Inject Web Vitals measurement script
    await page.addScriptTag({
      content: `
        // Core Web Vitals measurement
        window.webVitalsData = {};
        
        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            window.webVitalsData.fcp = fcpEntry.startTime;
          }
        }).observe({ entryTypes: ['paint'] });
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            window.webVitalsData.lcp = lastEntry.startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          window.webVitalsData.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // First Input Delay (simulated)
        let fidValue = null;
        const startTime = performance.now();
        
        ['click', 'keydown', 'touchstart'].forEach(eventType => {
          document.addEventListener(eventType, (event) => {
            if (fidValue === null) {
              const processingStart = performance.now();
              requestIdleCallback(() => {
                const processingEnd = performance.now();
                fidValue = processingEnd - processingStart;
                window.webVitalsData.fid = fidValue;
              });
            }
          }, { once: true, passive: true });
        });
        
        // Time to Interactive (approximation)
        window.addEventListener('load', () => {
          const loadTime = performance.now();
          
          // Wait for main thread to be idle
          requestIdleCallback(() => {
            window.webVitalsData.tti = performance.now();
          });
        });
      `
    });
    
    // Wait for page to fully load and measurements to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Allow time for measurements
    
    // Trigger a user interaction to measure FID
    await page.click('body');
    await page.waitForTimeout(100);
    
    // Get the measured vitals
    const webVitals = await page.evaluate(() => window.webVitalsData);
    
    console.log('Measured Core Web Vitals:', webVitals);
    
    // Validate Core Web Vitals thresholds
    const results = {
      timestamp: new Date().toISOString(),
      url: baseUrl,
      viewport: { width: 375, height: 667 },
      vitals: webVitals,
      thresholds: {
        fcp: { value: webVitals.fcp, threshold: 1800, passed: webVitals.fcp < 1800 },
        lcp: { value: webVitals.lcp, threshold: 2500, passed: webVitals.lcp < 2500 },
        cls: { value: webVitals.cls, threshold: 0.1, passed: webVitals.cls < 0.1 },
        fid: { value: webVitals.fid, threshold: 100, passed: !webVitals.fid || webVitals.fid < 100 },
        tti: { value: webVitals.tti, threshold: 3800, passed: !webVitals.tti || webVitals.tti < 3800 }
      }
    };
    
    // Save results
    await savePerformanceResults(results, `core-web-vitals-${Date.now()}.json`);
    
    // Assert thresholds
    if (webVitals.fcp) {
      expect(webVitals.fcp).toBeLessThan(1800); // Good FCP < 1.8s
    }
    
    if (webVitals.lcp) {
      expect(webVitals.lcp).toBeLessThan(2500); // Good LCP < 2.5s
    }
    
    if (webVitals.cls !== undefined) {
      expect(webVitals.cls).toBeLessThan(0.1); // Good CLS < 0.1
    }
    
    if (webVitals.fid) {
      expect(webVitals.fid).toBeLessThan(100); // Good FID < 100ms
    }
    
    if (webVitals.tti) {
      expect(webVitals.tti).toBeLessThan(3800); // Good TTI < 3.8s
    }
  });

  test('measure layout stability during interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Track layout shifts
    await page.addScriptTag({
      content: `
        window.layoutShifts = [];
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.layoutShifts.push({
              value: entry.value,
              hadRecentInput: entry.hadRecentInput,
              lastInputTime: entry.lastInputTime,
              sources: entry.sources ? entry.sources.map(source => ({
                node: source.node ? source.node.tagName : 'unknown',
                currentRect: source.currentRect,
                previousRect: source.previousRect
              })) : []
            });
          }
        }).observe({ entryTypes: ['layout-shift'] });
      `
    });
    
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Perform various interactions that might cause layout shifts
    const interactions = [
      () => page.hover('nav a:first-child'),
      () => page.click('button:first-of-type'),
      () => page.scroll(0, 500),
      () => page.scroll(0, 1000),
      () => page.setViewportSize({ width: 768, height: 1024 }), // Orientation change
      () => page.setViewportSize({ width: 375, height: 667 })
    ];
    
    for (const interaction of interactions) {
      try {
        await interaction();
        await page.waitForTimeout(500); // Allow time for layout shifts
      } catch (error) {
        // Continue if interaction fails
        console.warn('Interaction failed:', error.message);
      }
    }
    
    // Get layout shift data
    const layoutShifts = await page.evaluate(() => window.layoutShifts);
    
    console.log(`Recorded ${layoutShifts.length} layout shifts`);
    
    // Calculate total CLS
    const totalCLS = layoutShifts
      .filter(shift => !shift.hadRecentInput)
      .reduce((sum, shift) => sum + shift.value, 0);
    
    console.log('Total Cumulative Layout Shift:', totalCLS);
    
    // Save layout shift data
    await savePerformanceResults({
      timestamp: new Date().toISOString(),
      url: baseUrl,
      totalLayoutShifts: layoutShifts.length,
      totalCLS,
      shifts: layoutShifts
    }, `layout-shifts-${Date.now()}.json`);
    
    // Assert layout stability
    expect(totalCLS).toBeLessThan(0.1); // Good CLS threshold
    
    // Should not have excessive layout shifts
    expect(layoutShifts.length).toBeLessThan(10);
  });

  test('measure loading performance across network conditions', async ({ page }) => {
    const networkConditions = [
      {
        name: 'Fast 4G',
        downloadThroughput: 4 * 1024 * 1024 / 8, // 4 Mbps
        uploadThroughput: 3 * 1024 * 1024 / 8,   // 3 Mbps
        latency: 20
      },
      {
        name: 'Slow 4G',
        downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
        uploadThroughput: 750 * 1024 / 8,           // 750 Kbps
        latency: 150
      },
      {
        name: 'Slow 3G',
        downloadThroughput: 500 * 1024 / 8, // 500 Kbps
        uploadThroughput: 500 * 1024 / 8,   // 500 Kbps
        latency: 400
      }
    ];
    
    const networkResults = [];
    
    for (const condition of networkConditions) {
      console.log(`Testing on ${condition.name}...`);
      
      // Set network conditions
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: condition.downloadThroughput,
        uploadThroughput: condition.uploadThroughput,
        latency: condition.latency
      });
      
      // Measure loading performance
      const startTime = Date.now();
      await page.goto(baseUrl);
      
      // Wait for FCP
      const fcpTime = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
            }
          }).observe({ entryTypes: ['paint'] });
          
          // Timeout after 10 seconds
          setTimeout(() => resolve(null), 10000);
        });
      });
      
      await page.waitForLoadState('networkidle');
      const totalLoadTime = Date.now() - startTime;
      
      networkResults.push({
        condition: condition.name,
        network: condition,
        fcpMs: fcpTime,
        totalLoadMs: totalLoadTime
      });
      
      console.log(`${condition.name} results:`, {
        fcpMs: fcpTime,
        totalLoadMs: totalLoadTime
      });
    }
    
    // Save network performance results
    await savePerformanceResults({
      timestamp: new Date().toISOString(),
      url: baseUrl,
      results: networkResults
    }, `network-conditions-${Date.now()}.json`);
    
    // Validate performance on different networks
    const fast4G = networkResults.find(r => r.condition === 'Fast 4G');
    const slow4G = networkResults.find(r => r.condition === 'Slow 4G');
    const slow3G = networkResults.find(r => r.condition === 'Slow 3G');
    
    // Fast 4G should have good performance
    if (fast4G && fast4G.fcpMs) {
      expect(fast4G.fcpMs).toBeLessThan(1500);
      expect(fast4G.totalLoadMs).toBeLessThan(3000);
    }
    
    // Slow 4G should still be usable
    if (slow4G && slow4G.fcpMs) {
      expect(slow4G.fcpMs).toBeLessThan(3000);
      expect(slow4G.totalLoadMs).toBeLessThan(8000);
    }
    
    // Even on Slow 3G, should eventually load
    if (slow3G) {
      expect(slow3G.totalLoadMs).toBeLessThan(15000); // 15 second max
    }
  });
});