import React, { useState } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { useScreenReader } from '../hooks/useScreenReader';

const AccessibilityControls = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    preferences,
    accessibilityMode,
    toggleHighContrast,
    isHighContrast,
    isHighZoom,
    isReducedMotion
  } = useAccessibility();

  const {
    announce,
    getButtonAria
  } = useScreenReader();

  const handleToggleHighContrast = () => {
    toggleHighContrast();
    announce(
      `High contrast mode ${!isHighContrast ? 'enabled' : 'disabled'}`,
      'assertive'
    );
  };

  const handleToggleMenu = () => {
    setIsOpen(prev => {
      const newState = !prev;
      announce(
        `Accessibility controls ${newState ? 'opened' : 'closed'}`,
        'polite'
      );
      return newState;
    });
  };

  return (
    <div className={`accessibility-controls ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={handleToggleMenu}
        className="accessibility-toggle-btn bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
        {...getButtonAria({
          label: `${isOpen ? 'Close' : 'Open'} accessibility controls`,
          expanded: isOpen,
          controls: 'accessibility-panel'
        })}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 10.5V12.5L21 13V11L15 10.5ZM11 15.5H13L11.5 7.5H9.5L8 15.5H10L10.25 14H11.75L11 15.5ZM10.5 12L11 9.5L11.5 12H10.5Z" />
        </svg>
        <span className="sr-only">Accessibility Controls</span>
      </button>

      {/* Controls Panel */}
      {isOpen && (
        <div
          id="accessibility-panel"
          className="accessibility-panel absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 min-w-[280px] z-50"
          role="dialog"
          aria-modal="false"
          aria-label="Accessibility controls panel"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Accessibility Options
          </h3>

          {/* High Contrast Toggle */}
          <div className="mb-4">
            <button
              onClick={handleToggleHighContrast}
              className={`w-full text-left p-3 rounded-md border-2 transition-colors min-h-[44px] flex items-center justify-between ${
                isHighContrast
                  ? 'bg-blue-100 border-blue-500 text-blue-900'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
              {...getButtonAria({
                label: `${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`,
                pressed: isHighContrast
              })}
            >
              <div>
                <div className="font-medium">High Contrast</div>
                <div className="text-sm opacity-75">
                  Increase color contrast for better visibility
                </div>
              </div>
              <div className="ml-3">
                {isHighContrast ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                )}
              </div>
            </button>
          </div>

          {/* Status Information */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Zoom Level:</span>
              <span className={isHighZoom ? 'font-semibold text-orange-600' : ''}>
                {preferences.zoomLevel}%
                {isHighZoom && ' (High)'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Reduced Motion:</span>
              <span className={isReducedMotion ? 'font-semibold text-green-600' : ''}>
                {isReducedMotion ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Dark Mode:</span>
              <span>
                {preferences.darkMode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              These settings help improve accessibility. Some changes are detected automatically from your system preferences.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleToggleMenu}
            className="mt-4 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-h-[44px]"
            {...getButtonAria({
              label: 'Close accessibility controls'
            })}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessibilityControls;