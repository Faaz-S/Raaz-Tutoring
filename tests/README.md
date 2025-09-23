# Testing Suite Documentation

This directory contains comprehensive testing suites for visual regression and performance testing of the Raaz Tutoring website.

## Overview

The testing suite includes:

1. **Visual Regression Testing** - Automated screenshot comparison across devices and browsers
2. **Performance Testing** - Mobile and desktop performance monitoring with Core Web Vitals
3. **Lighthouse CI** - Automated performance auditing and budgets

## Directory Structure

```
tests/
├── visual/                     # Visual regression tests
│   ├── utils/
│   │   └── screenshot-helper.js    # Screenshot utilities
│   ├── homepage.spec.js            # Homepage visual tests
│   ├── components.spec.js          # Component visual tests
│   └── cross-browser.spec.js       # Cross-browser tests
├── performance/                # Performance tests
│   ├── utils/
│   │   └── performance-helper.js   # Performance utilities
│   ├── mobile-performance.spec.js  # Mobile performance tests
│   ├── device-performance.spec.js  # Multi-device tests
│   ├── core-web-vitals.spec.js     # Core Web Vitals monitoring
│   └── performance-dashboard.js    # Dashboard generator
├── run-tests.js               # Test runner script
└── README.md                  # This file
```

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Playwright** browsers installed
3. **Lighthouse CI** for performance auditing

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Visual Regression Tests

```bash
# Run all visual tests
npm run test:visual

# Update visual baselines
npm run test:visual:update

# View visual test report
npm run test:visual:report
```

### Performance Tests

```bash
# Run all performance tests
npm run test:performance

# Run mobile-specific performance tests
npm run test:performance:mobile

# Run device comparison tests
npm run test:performance:devices

# Run Core Web Vitals monitoring
npm run test:performance:vitals
```

### Lighthouse CI

```bash
# Run Lighthouse audit
npm run test:lighthouse

# Run mobile-focused Lighthouse audit
npm run test:lighthouse:mobile
```

### All Tests

```bash
# Run complete test suite
npm run test:all

# Use test runner with options
npm run test:runner visual
npm run test:runner performance
npm run test:runner all
```

## Configuration

### Visual Testing Configuration

**File**: `playwright.config.js`

- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Mobile, Tablet, Desktop viewports
- **Screenshots**: Full page with animation disabled
- **Thresholds**: Configurable pixel difference tolerance

### Performance Testing Configuration

**File**: `lighthouserc.js`

- **Performance Budgets**: Device-specific thresholds
- **Core Web Vitals**: FCP, LCP, CLS, TBT monitoring
- **Network Conditions**: 3G, 4G, WiFi simulation
- **Device Emulation**: Mobile, tablet, desktop

## Performance Budgets

### Mobile Performance Targets

| Metric | Target | Threshold |
|--------|--------|-----------|
| Performance Score | ≥80% | Good |
| First Contentful Paint | ≤2000ms | Good |
| Largest Contentful Paint | ≤3000ms | Good |
| Cumulative Layout Shift | ≤0.1 | Good |
| Total Blocking Time | ≤300ms | Good |

### Desktop Performance Targets

| Metric | Target | Threshold |
|--------|--------|-----------|
| Performance Score | ≥90% | Good |
| First Contentful Paint | ≤1000ms | Good |
| Largest Contentful Paint | ≤2000ms | Good |
| Cumulative Layout Shift | ≤0.1 | Good |
| Total Blocking Time | ≤150ms | Good |

## Test Results

### Visual Test Results

- **Location**: `test-results/visual/`
- **Screenshots**: Baseline and comparison images
- **Reports**: HTML reports with diff visualization
- **Artifacts**: Uploaded to CI/CD for review

### Performance Test Results

- **Location**: `test-results/performance/`
- **Metrics**: JSON files with detailed metrics
- **Dashboard**: HTML dashboard with trends
- **Lighthouse**: Detailed audit reports

## CI/CD Integration

### GitHub Actions

The testing suite integrates with GitHub Actions for:

- **Automated Testing**: Run on every PR and push
- **Baseline Management**: Update baselines on main branch
- **Performance Monitoring**: Daily performance checks
- **Result Reporting**: PR comments with test results

### Workflow Files

- `.github/workflows/visual-regression.yml` - Main testing workflow

## Troubleshooting

### Common Issues

1. **Browser Installation**
   ```bash
   npx playwright install --with-deps
   ```

2. **Permission Issues**
   ```bash
   chmod +x tests/run-tests.js
   ```

3. **Memory Issues**
   - Reduce parallel workers in CI
   - Increase Node.js memory limit

4. **Network Timeouts**
   - Increase timeout values in config
   - Check network connectivity

### Debug Mode

```bash
# Run with debug output
DEBUG=pw:api npm run test:visual

# Run headed (visible browser)
npm run test:visual -- --headed

# Run specific test file
npx playwright test tests/visual/homepage.spec.js
```

## Best Practices

### Visual Testing

1. **Stable Baselines**: Ensure consistent test environment
2. **Hide Dynamic Content**: Mask timestamps, loading states
3. **Responsive Testing**: Test all major breakpoints
4. **Cross-Browser**: Validate across different browsers

### Performance Testing

1. **Realistic Conditions**: Test under various network conditions
2. **Device Variety**: Test mobile, tablet, and desktop
3. **Budget Monitoring**: Set and enforce performance budgets
4. **Trend Analysis**: Monitor performance over time

### Maintenance

1. **Regular Updates**: Keep baselines current
2. **Threshold Tuning**: Adjust thresholds based on requirements
3. **Test Cleanup**: Remove obsolete tests
4. **Documentation**: Keep documentation updated

## Contributing

When adding new tests:

1. Follow existing naming conventions
2. Add appropriate documentation
3. Update configuration files if needed
4. Test locally before committing
5. Update this README if adding new features

## Support

For issues or questions:

1. Check existing test results and logs
2. Review configuration files
3. Consult Playwright and Lighthouse documentation
4. Create issue with detailed reproduction steps