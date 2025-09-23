/**
 * Screen reader utilities and optimizations
 */

/**
 * Create a live region for screen reader announcements
 * @param {string} id - Unique ID for the live region
 * @param {string} priority - 'polite' or 'assertive'
 * @returns {HTMLElement} The live region element
 */
export const createLiveRegion = (id = 'sr-live-region', priority = 'polite') => {
  // Check if live region already exists
  let liveRegion = document.getElementById(id);
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
  }
  
  return liveRegion;
};

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 * @param {number} delay - Delay before clearing message (ms)
 */
export const announceToScreenReader = (message, priority = 'polite', delay = 1000) => {
  const liveRegion = createLiveRegion(`sr-live-${priority}`, priority);
  
  // Clear any existing message
  liveRegion.textContent = '';
  
  // Use setTimeout to ensure screen readers pick up the change
  setTimeout(() => {
    liveRegion.textContent = message;
    
    // Clear the message after delay to avoid repetition
    setTimeout(() => {
      liveRegion.textContent = '';
    }, delay);
  }, 100);
};

/**
 * Announce navigation changes
 * @param {string} from - Previous location
 * @param {string} to - New location
 */
export const announceNavigation = (from, to) => {
  const message = `Navigated from ${from} to ${to}`;
  announceToScreenReader(message, 'polite');
};

/**
 * Announce modal/overlay state changes
 * @param {string} action - 'opened' or 'closed'
 * @param {string} modalName - Name of the modal/overlay
 */
export const announceModalState = (action, modalName) => {
  const message = `${modalName} ${action}`;
  announceToScreenReader(message, 'assertive');
};

/**
 * Announce form validation results
 * @param {boolean} isValid - Whether form is valid
 * @param {Array} errors - Array of error messages
 */
export const announceFormValidation = (isValid, errors = []) => {
  if (isValid) {
    announceToScreenReader('Form submitted successfully', 'polite');
  } else {
    const errorCount = errors.length;
    const message = `Form has ${errorCount} error${errorCount !== 1 ? 's' : ''}. ${errors.join('. ')}`;
    announceToScreenReader(message, 'assertive');
  }
};

/**
 * Announce loading states
 * @param {boolean} isLoading - Whether content is loading
 * @param {string} content - What is being loaded
 */
export const announceLoadingState = (isLoading, content = 'content') => {
  const message = isLoading ? `Loading ${content}` : `${content} loaded`;
  announceToScreenReader(message, 'polite');
};

/**
 * Create descriptive text for complex UI elements
 * @param {Object} element - Element description
 * @returns {string} Descriptive text
 */
export const createElementDescription = (element) => {
  const { type, state, position, total, label } = element;
  
  let description = label || '';
  
  if (type) {
    description += ` ${type}`;
  }
  
  if (state) {
    description += `, ${state}`;
  }
  
  if (position && total) {
    description += `, ${position} of ${total}`;
  }
  
  return description.trim();
};

/**
 * Generate ARIA labels for responsive navigation
 * @param {boolean} isMobile - Whether in mobile view
 * @param {boolean} isOpen - Whether menu is open (for mobile)
 * @param {string} menuType - Type of menu ('main', 'mobile', etc.)
 * @returns {Object} ARIA attributes
 */
export const generateNavigationAria = (isMobile, isOpen = false, menuType = 'main') => {
  const baseAttrs = {
    role: 'navigation',
    'aria-label': `${menuType} navigation`
  };
  
  if (isMobile) {
    return {
      ...baseAttrs,
      'aria-label': `${menuType} navigation menu`,
      'aria-expanded': isOpen.toString(),
      'aria-hidden': (!isOpen).toString()
    };
  }
  
  return baseAttrs;
};

/**
 * Generate ARIA attributes for interactive elements
 * @param {Object} element - Element configuration
 * @returns {Object} ARIA attributes
 */
export const generateInteractiveAria = (element) => {
  const {
    role,
    label,
    describedBy,
    expanded,
    selected,
    checked,
    disabled,
    required,
    invalid,
    current,
    controls,
    owns,
    hasPopup
  } = element;
  
  const attrs = {};
  
  if (role) attrs.role = role;
  if (label) attrs['aria-label'] = label;
  if (describedBy) attrs['aria-describedby'] = describedBy;
  if (expanded !== undefined) attrs['aria-expanded'] = expanded.toString();
  if (selected !== undefined) attrs['aria-selected'] = selected.toString();
  if (checked !== undefined) attrs['aria-checked'] = checked.toString();
  if (disabled !== undefined) attrs['aria-disabled'] = disabled.toString();
  if (required !== undefined) attrs['aria-required'] = required.toString();
  if (invalid !== undefined) attrs['aria-invalid'] = invalid.toString();
  if (current) attrs['aria-current'] = current;
  if (controls) attrs['aria-controls'] = controls;
  if (owns) attrs['aria-owns'] = owns;
  if (hasPopup) attrs['aria-haspopup'] = hasPopup;
  
  return attrs;
};

/**
 * Create screen reader friendly content hierarchy
 * @param {Array} headings - Array of heading objects {level, text, id}
 * @returns {string} HTML string with proper heading hierarchy
 */
export const createHeadingHierarchy = (headings) => {
  return headings.map(({ level, text, id }) => {
    const Tag = `h${Math.min(Math.max(level, 1), 6)}`;
    const idAttr = id ? ` id="${id}"` : '';
    return `<${Tag}${idAttr}>${text}</${Tag}>`;
  }).join('\n');
};

/**
 * Generate skip links for screen readers
 * @param {Array} targets - Array of skip targets {href, label}
 * @returns {string} HTML string with skip links
 */
export const generateSkipLinks = (targets) => {
  return targets.map(({ href, label }) => 
    `<a href="${href}" class="sr-only focus:not-sr-only skip-nav">${label}</a>`
  ).join('\n');
};

/**
 * Create accessible table markup
 * @param {Object} table - Table configuration
 * @returns {Object} Table attributes and structure
 */
export const createAccessibleTable = (table) => {
  const { caption, headers, scope, summary } = table;
  
  const attrs = {
    role: 'table'
  };
  
  if (summary) {
    attrs['aria-describedby'] = 'table-summary';
  }
  
  const structure = {
    caption: caption ? `<caption>${caption}</caption>` : '',
    summary: summary ? `<div id="table-summary" class="sr-only">${summary}</div>` : '',
    headerAttrs: headers ? { scope: scope || 'col' } : {}
  };
  
  return { attrs, structure };
};

/**
 * Monitor and announce layout changes for responsive design
 * @param {string} breakpoint - Current breakpoint
 * @param {string} previousBreakpoint - Previous breakpoint
 */
export const announceLayoutChange = (breakpoint, previousBreakpoint) => {
  if (breakpoint !== previousBreakpoint) {
    const message = `Layout changed to ${breakpoint} view`;
    announceToScreenReader(message, 'polite', 2000);
  }
};

/**
 * Create accessible form field descriptions
 * @param {Object} field - Field configuration
 * @returns {Object} Field attributes and descriptions
 */
export const createAccessibleFormField = (field) => {
  const {
    id,
    label,
    required,
    invalid,
    errorMessage,
    helpText,
    type
  } = field;
  
  const describedByIds = [];
  let descriptions = '';
  
  if (helpText) {
    const helpId = `${id}-help`;
    describedByIds.push(helpId);
    descriptions += `<div id="${helpId}" class="sr-only">${helpText}</div>`;
  }
  
  if (invalid && errorMessage) {
    const errorId = `${id}-error`;
    describedByIds.push(errorId);
    descriptions += `<div id="${errorId}" class="sr-only" role="alert">${errorMessage}</div>`;
  }
  
  const attrs = {
    'aria-label': label,
    'aria-required': required ? 'true' : 'false',
    'aria-invalid': invalid ? 'true' : 'false'
  };
  
  if (describedByIds.length > 0) {
    attrs['aria-describedby'] = describedByIds.join(' ');
  }
  
  return { attrs, descriptions };
};