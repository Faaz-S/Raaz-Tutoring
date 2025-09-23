module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:4173',
        'http://localhost:4173/', // Ensure trailing slash is tested too
      ],
      
      // Number of runs per URL
      numberOfRuns: 3,
      
      // Lighthouse settings
      settings: {
        // Emulate mobile device
        emulatedFormFactor: 'mobile',
        
        // Throttling settings for mobile
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
        
        // Screen emulation
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          disabled: false,
        },
        
        // Skip certain audits that might be flaky
        skipAudits: [
          'canonical',
          'uses-http2',
          'bf-cache',
        ],
        
        // Only run performance, accessibility, and best practices
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
      },
    },
    
    assert: {
      // Performance budgets
      assertions: {
        // Core Web Vitals
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        
        // Specific metrics
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        
        // Resource optimization
        'unused-css-rules': ['warn', { maxLength: 0 }],
        'unused-javascript': ['warn', { maxLength: 0 }],
        'modern-image-formats': ['warn', { maxLength: 0 }],
        'offscreen-images': ['warn', { maxLength: 0 }],
        
        // Accessibility
        'color-contrast': ['error', { maxLength: 0 }],
        'image-alt': ['error', { maxLength: 0 }],
        'label': ['error', { maxLength: 0 }],
        'link-name': ['error', { maxLength: 0 }],
        
        // Best practices
        'is-on-https': ['error', { maxLength: 0 }],
        'uses-responsive-images': ['warn', { maxLength: 0 }],
        'efficient-animated-content': ['warn', { maxLength: 0 }],
      },
    },
    
    upload: {
      // Store results locally for now
      target: 'filesystem',
      outputDir: './test-results/lighthouse',
    },
    
    server: {
      // Start preview server before testing
      command: 'npm run preview',
      port: 4173,
      
      // Wait for server to be ready
      waitForServer: {
        timeout: 60000,
        retries: 5,
        retryDelay: 5000,
      },
    },
  },
};