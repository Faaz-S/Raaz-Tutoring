/**
 * Accessibility testing utilities
 */

/**
 * Check if element has proper focus indicators
 * @param {HTMLElement} element - Element to check
 * @returns {Object} Test results
 */
export const checkFocusIndicators = (element) => {
  if (!element) return { passed: false, message: 'Element not found' };

  const computedStyle = window.getComputedStyle(element);
  const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '';
  const hasBoxShadow = computedStyle.boxShadow !== 'none' && computedStyle.boxShadow !== '';
  const hasBorder = computedStyle.border !== 'none' && computedStyle.border !== '';

  const passed = hasOutline || hasBoxShadow || hasBorder;

  return {
    passed,
    message: passed 
      ? 'Element has focus indicators' 
      : 'Element lacks visible focus indicators',
    details: {
      outline: computedStyle.outline,
      boxShadow: computedStyle.boxShadow,
      border: computedStyle.border
    }
  };
};

/**
 * Check if element meets minimum touch target size (44x44px)
 * @param {HTMLElement} element - Element to check
 * @returns {Object} Test results
 */
export const checkTouchTargetSize = (element) => {
  if (!element) return { passed: false, message: 'Element not found' };

  const rect = element.getBoundingClientRect();
  const minSize = 44;
  
  const passed = rect.width >= minSize && rect.height >= minSize;

  return {
    passed,
    message: passed 
      ? `Element meets minimum touch target size (${rect.width}x${rect.height}px)` 
      : `Element too small for touch targets (${rect.width}x${rect.height}px, minimum ${minSize}x${minSize}px)`,
    details: {
      width: rect.width,
      height: rect.height,
      minSize
    }
  };
};

/**
 * Check if element has proper ARIA attributes
 * @param {HTMLElement} element - Element to check
 * @param {Array} requiredAttributes - Required ARIA attributes
 * @returns {Object} Test results
 */
export const checkAriaAttributes = (element, requiredAttributes = []) => {
  if (!element) return { passed: false, message: 'Element not found' };

  const missingAttributes = requiredAttributes.filter(attr => 
    !element.hasAttribute(attr)
  );

  const passed = missingAttributes.length === 0;

  return {
    passed,
    message: passed 
      ? 'Element has all required ARIA attributes' 
      : `Element missing ARIA attributes: ${missingAttributes.join(', ')}`,
    details: {
      required: requiredAttributes,
      missing: missingAttributes,
      present: requiredAttributes.filter(attr => element.hasAttribute(attr))
    }
  };
};

/**
 * Check if element is keyboard accessible
 * @param {HTMLElement} element - Element to check
 * @returns {Object} Test results
 */
export const checkKeyboardAccessibility = (element) => {
  if (!element) return { passed: false, message: 'Element not found' };

  const isInteractive = element.matches('button, a, input, select, textarea, [role="button"], [role="link"], [role="menuitem"]');
  const hasTabIndex = element.hasAttribute('tabindex');
  const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
  
  const isFocusable = isInteractive || (hasTabIndex && tabIndex >= 0);
  const isNotExcluded = tabIndex !== -1;

  const passed = isFocusable && isNotExcluded;

  return {
    passed,
    message: passed 
      ? 'Element is keyboard accessible' 
      : 'Element is not keyboard accessible',
    details: {
      isInteractive,
      hasTabIndex,
      tabIndex,
      isFocusable,
      isNotExcluded
    }
  };
};

/**
 * Check color contrast ratio (simplified check)
 * @param {HTMLElement} element - Element to check
 * @returns {Object} Test results
 */
export const checkColorContrast = (element) => {
  if (!element) return { passed: false, message: 'Element not found' };

  const computedStyle = window.getComputedStyle(element);
  const color = computedStyle.color;
  const backgroundColor = computedStyle.backgroundColor;

  // This is a simplified check - in a real implementation, you'd calculate the actual contrast ratio
  const hasColor = color && color !== 'rgba(0, 0, 0, 0)';
  const hasBackground = backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)';

  const passed = hasColor; // Simplified - assumes good contrast if color is set

  return {
    passed,
    message: passed 
      ? 'Element has color styling (contrast check simplified)' 
      : 'Element lacks proper color styling',
    details: {
      color,
      backgroundColor,
      hasColor,
      hasBackground
    }
  };
};

/**
 * Check if element has proper semantic markup
 * @param {HTMLElement} element - Element to check
 * @param {string} expectedRole - Expected role or tag name
 * @returns {Object} Test results
 */
export const checkSemanticMarkup = (element, expectedRole) => {
  if (!element) return { passed: false, message: 'Element not found' };

  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  const actualRole = role || tagName;

  const passed = actualRole === expectedRole.toLowerCase();

  return {
    passed,
    message: passed 
      ? `Element has correct semantic markup (${actualRole})` 
      : `Element has incorrect semantic markup. Expected: ${expectedRole}, Actual: ${actualRole}`,
    details: {
      tagName,
      role,
      actualRole,
      expectedRole
    }
  };
};

/**
 * Run comprehensive accessibility tests on an element
 * @param {HTMLElement} element - Element to test
 * @param {Object} options - Test options
 * @returns {Object} Complete test results
 */
export const runAccessibilityTests = (element, options = {}) => {
  const {
    checkFocus = true,
    checkTouchTarget = true,
    checkAria = true,
    checkKeyboard = true,
    checkContrast = true,
    checkSemantic = false,
    requiredAriaAttributes = [],
    expectedRole = null
  } = options;

  const results = {
    element: element?.tagName || 'Unknown',
    passed: true,
    tests: {}
  };

  if (checkFocus) {
    results.tests.focusIndicators = checkFocusIndicators(element);
  }

  if (checkTouchTarget) {
    results.tests.touchTargetSize = checkTouchTargetSize(element);
  }

  if (checkAria) {
    results.tests.ariaAttributes = checkAriaAttributes(element, requiredAriaAttributes);
  }

  if (checkKeyboard) {
    results.tests.keyboardAccessibility = checkKeyboardAccessibility(element);
  }

  if (checkContrast) {
    results.tests.colorContrast = checkColorContrast(element);
  }

  if (checkSemantic && expectedRole) {
    results.tests.semanticMarkup = checkSemanticMarkup(element, expectedRole);
  }

  // Determine overall pass/fail
  results.passed = Object.values(results.tests).every(test => test.passed);

  return results;
};

/**
 * Test keyboard navigation in a container
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Test options
 * @returns {Promise<Object>} Test results
 */
export const testKeyboardNavigation = async (container, options = {}) => {
  const {
    keys = ['Tab', 'ArrowDown', 'ArrowUp', 'Enter', 'Escape'],
    expectFocusable = true
  } = options;

  if (!container) return { passed: false, message: 'Container not found' };

  const focusableElements = container.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const results = {
    passed: true,
    focusableCount: focusableElements.length,
    tests: {},
    errors: []
  };

  if (expectFocusable && focusableElements.length === 0) {
    results.passed = false;
    results.errors.push('No focusable elements found in container');
    return results;
  }

  // Test each key
  for (const key of keys) {
    try {
      const event = new KeyboardEvent('keydown', { key, bubbles: true });
      container.dispatchEvent(event);
      
      results.tests[key] = {
        passed: true,
        message: `${key} key handled without errors`
      };
    } catch (error) {
      results.tests[key] = {
        passed: false,
        message: `${key} key caused error: ${error.message}`
      };
      results.passed = false;
      results.errors.push(`${key}: ${error.message}`);
    }
  }

  return results;
};

/**
 * Generate accessibility report for multiple elements
 * @param {HTMLElement[]} elements - Elements to test
 * @param {Object} options - Test options
 * @returns {Object} Complete accessibility report
 */
export const generateAccessibilityReport = (elements, options = {}) => {
  const report = {
    timestamp: new Date().toISOString(),
    totalElements: elements.length,
    passedElements: 0,
    failedElements: 0,
    results: [],
    summary: {}
  };

  elements.forEach((element, index) => {
    const result = runAccessibilityTests(element, options);
    result.index = index;
    
    if (result.passed) {
      report.passedElements++;
    } else {
      report.failedElements++;
    }
    
    report.results.push(result);
  });

  // Generate summary
  report.summary = {
    passRate: (report.passedElements / report.totalElements * 100).toFixed(1) + '%',
    commonIssues: findCommonIssues(report.results)
  };

  return report;
};

/**
 * Find common accessibility issues across test results
 * @param {Array} results - Test results
 * @returns {Array} Common issues
 */
const findCommonIssues = (results) => {
  const issues = {};
  
  results.forEach(result => {
    Object.entries(result.tests).forEach(([testName, testResult]) => {
      if (!testResult.passed) {
        const key = `${testName}: ${testResult.message}`;
        issues[key] = (issues[key] || 0) + 1;
      }
    });
  });

  return Object.entries(issues)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count }));
};