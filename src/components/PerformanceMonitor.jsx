/**
 * Performance monitoring component for critical CSS loading
 * Only renders in development mode
 */
import React from 'react';
import { useCriticalCSS } from '../hooks/useCriticalCSS';

const PerformanceMonitor = () => {
  const { isLoaded, performanceMetrics } = useCriticalCSS({
    enablePerformanceMonitoring: process.env.NODE_ENV === 'development'
  });
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
        maxWidth: '300px'
      }}
    >
      <div><strong>Performance Metrics</strong></div>
      <div>Critical CSS Loaded: {isLoaded ? '✅' : '⏳'}</div>
      {performanceMetrics.firstPaint && (
        <div>First Paint: {Math.round(performanceMetrics.firstPaint)}ms</div>
      )}
      {performanceMetrics.firstContentfulPaint && (
        <div>FCP: {Math.round(performanceMetrics.firstContentfulPaint)}ms</div>
      )}
      {performanceMetrics.domContentLoaded && (
        <div>DOM Ready: {Math.round(performanceMetrics.domContentLoaded)}ms</div>
      )}
      {performanceMetrics.loadComplete && (
        <div>Load Complete: {Math.round(performanceMetrics.loadComplete)}ms</div>
      )}
    </div>
  );
};

export default PerformanceMonitor;