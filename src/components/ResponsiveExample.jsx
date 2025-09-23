import React from 'react';
import { useResponsive, useMobile, useTablet, useDesktop } from '../hooks/useResponsive';

/**
 * Example component demonstrating responsive utilities usage
 * This component shows different content based on screen size
 */
const ResponsiveExample = () => {
  const responsive = useResponsive();
  const isMobile = useMobile();
  const isTablet = useTablet();
  const isDesktop = useDesktop();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Responsive Information</h3>
      
      <div className="space-y-2">
        <p><strong>Screen Width:</strong> {responsive.width}px</p>
        <p><strong>Screen Height:</strong> {responsive.height}px</p>
        <p><strong>Current Breakpoint:</strong> {responsive.breakpoint}</p>
        <p><strong>Device Type:</strong> {responsive.deviceType}</p>
        <p><strong>Orientation:</strong> {responsive.orientation}</p>
      </div>

      <div className="mt-4 space-y-2">
        <p><strong>Device Checks:</strong></p>
        <ul className="list-disc list-inside ml-4">
          <li>Mobile: {isMobile ? '✅' : '❌'}</li>
          <li>Tablet: {isTablet ? '✅' : '❌'}</li>
          <li>Desktop: {isDesktop ? '✅' : '❌'}</li>
        </ul>
      </div>

      {/* Conditional content based on device type */}
      <div className="mt-4 p-3 rounded bg-gray-100">
        {isMobile && (
          <p className="text-blue-600">📱 Mobile-specific content displayed</p>
        )}
        {isTablet && (
          <p className="text-green-600">📱 Tablet-specific content displayed</p>
        )}
        {isDesktop && (
          <p className="text-purple-600">🖥️ Desktop-specific content displayed</p>
        )}
      </div>
    </div>
  );
};

export default ResponsiveExample;