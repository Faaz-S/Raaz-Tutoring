/**
 * Performance Dashboard Configuration
 * Generates HTML reports for performance monitoring
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Generate performance dashboard HTML
 */
export async function generatePerformanceDashboard(resultsDir = 'test-results/performance') {
  try {
    // Read all performance result files
    const files = await fs.readdir(resultsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const results = [];
    
    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(path.join(resultsDir, file), 'utf8');
        const data = JSON.parse(content);
        results.push({
          filename: file,
          timestamp: data.timestamp || new Date(0).toISOString(),
          ...data
        });
      } catch (error) {
        console.warn(`Failed to parse ${file}:`, error.message);
      }
    }
    
    // Sort by timestamp
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Generate HTML dashboard
    const html = generateDashboardHTML(results);
    
    // Save dashboard
    const dashboardPath = path.join(resultsDir, 'dashboard.html');
    await fs.writeFile(dashboardPath, html);
    
    console.log(`Performance dashboard generated: ${dashboardPath}`);
    return dashboardPath;
    
  } catch (error) {
    console.error('Failed to generate performance dashboard:', error.message);
    throw error;
  }
}

/**
 * Generate HTML content for dashboard
 */
function generateDashboardHTML(results) {
  const latestResults = results.slice(0, 10); // Show latest 10 results
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Dashboard - Raaz Tutoring</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #7f8c8d;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .metric-card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .metric-value.good { color: #27ae60; }
        .metric-value.needs-improvement { color: #f39c12; }
        .metric-value.poor { color: #e74c3c; }
        
        .metric-label {
            font-size: 12px;
            color: #7f8c8d;
            text-transform: uppercase;
        }
        
        .results-table {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .results-table h2 {
            padding: 20px;
            background: #34495e;
            color: white;
            margin: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-badge.passed {
            background: #d4edda;
            color: #155724;
        }
        
        .status-badge.failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .recommendations {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-top: 30px;
        }
        
        .recommendations h2 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .recommendation {
            padding: 15px;
            margin-bottom: 15px;
            border-left: 4px solid #3498db;
            background: #f8f9fa;
        }
        
        .recommendation h4 {
            color: #2c3e50;
            margin-bottom: 8px;
        }
        
        .recommendation p {
            color: #7f8c8d;
            margin-bottom: 10px;
        }
        
        .recommendation ul {
            margin-left: 20px;
        }
        
        .recommendation li {
            color: #555;
            margin-bottom: 5px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            
            table {
                font-size: 14px;
            }
            
            th, td {
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Performance Dashboard</h1>
            <p>Real-time performance monitoring for Raaz Tutoring website</p>
            <p>Last updated: ${new Date().toLocaleString()}</p>
        </div>
        
        ${generateMetricsGrid(latestResults)}
        
        <div class="results-table">
            <h2>Recent Performance Tests</h2>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Test Type</th>
                        <th>Device</th>
                        <th>Performance Score</th>
                        <th>FCP (ms)</th>
                        <th>LCP (ms)</th>
                        <th>CLS</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateResultsTable(latestResults)}
                </tbody>
            </table>
        </div>
        
        ${generateRecommendations(results)}
    </div>
</body>
</html>`;
}

/**
 * Generate metrics grid HTML
 */
function generateMetricsGrid(results) {
  if (results.length === 0) {
    return '<div class="metric-card"><p>No performance data available</p></div>';
  }
  
  const latest = results[0];
  const metrics = extractMetricsFromResult(latest);
  
  return `
    <div class="metrics-grid">
        <div class="metric-card">
            <h3>Performance Score</h3>
            <div class="metric-value ${getScoreClass(metrics.performanceScore)}">${metrics.performanceScore}%</div>
            <div class="metric-label">Overall Performance</div>
        </div>
        
        <div class="metric-card">
            <h3>First Contentful Paint</h3>
            <div class="metric-value ${getFCPClass(metrics.fcp)}">${metrics.fcp}ms</div>
            <div class="metric-label">Time to first content</div>
        </div>
        
        <div class="metric-card">
            <h3>Largest Contentful Paint</h3>
            <div class="metric-value ${getLCPClass(metrics.lcp)}">${metrics.lcp}ms</div>
            <div class="metric-label">Time to main content</div>
        </div>
        
        <div class="metric-card">
            <h3>Cumulative Layout Shift</h3>
            <div class="metric-value ${getCLSClass(metrics.cls)}">${metrics.cls}</div>
            <div class="metric-label">Visual stability</div>
        </div>
    </div>`;
}

/**
 * Generate results table HTML
 */
function generateResultsTable(results) {
  return results.map(result => {
    const metrics = extractMetricsFromResult(result);
    const status = getOverallStatus(result);
    
    return `
      <tr>
        <td>${new Date(result.timestamp).toLocaleString()}</td>
        <td>${getTestType(result)}</td>
        <td>${getDevice(result)}</td>
        <td>${metrics.performanceScore}%</td>
        <td>${metrics.fcp}ms</td>
        <td>${metrics.lcp}ms</td>
        <td>${metrics.cls}</td>
        <td><span class="status-badge ${status.toLowerCase()}">${status}</span></td>
      </tr>`;
  }).join('');
}

/**
 * Generate recommendations HTML
 */
function generateRecommendations(results) {
  const recommendations = [
    {
      title: 'Optimize Images',
      description: 'Use modern image formats and responsive images',
      actions: [
        'Convert images to WebP format',
        'Implement responsive image loading',
        'Add lazy loading for below-the-fold images',
        'Optimize image compression'
      ]
    },
    {
      title: 'Minimize JavaScript',
      description: 'Reduce JavaScript bundle size and execution time',
      actions: [
        'Split large bundles into smaller chunks',
        'Remove unused JavaScript code',
        'Use dynamic imports for non-critical code',
        'Optimize third-party scripts'
      ]
    },
    {
      title: 'Improve Loading Performance',
      description: 'Optimize critical rendering path',
      actions: [
        'Inline critical CSS',
        'Preload important resources',
        'Use service workers for caching',
        'Optimize server response times'
      ]
    }
  ];
  
  return `
    <div class="recommendations">
        <h2>Performance Recommendations</h2>
        ${recommendations.map(rec => `
          <div class="recommendation">
              <h4>${rec.title}</h4>
              <p>${rec.description}</p>
              <ul>
                  ${rec.actions.map(action => `<li>${action}</li>`).join('')}
              </ul>
          </div>
        `).join('')}
    </div>`;
}

/**
 * Helper functions
 */
function extractMetricsFromResult(result) {
  const defaults = { performanceScore: 0, fcp: 0, lcp: 0, cls: 0 };
  
  if (result.metrics) {
    return {
      performanceScore: Math.round(result.metrics['performance-score'] || 0),
      fcp: Math.round(result.metrics['first-contentful-paint'] || 0),
      lcp: Math.round(result.metrics['largest-contentful-paint'] || 0),
      cls: (result.metrics['cumulative-layout-shift'] || 0).toFixed(3)
    };
  }
  
  if (result.vitals) {
    return {
      performanceScore: 0,
      fcp: Math.round(result.vitals.fcp || 0),
      lcp: Math.round(result.vitals.lcp || 0),
      cls: (result.vitals.cls || 0).toFixed(3)
    };
  }
  
  return defaults;
}

function getScoreClass(score) {
  if (score >= 90) return 'good';
  if (score >= 50) return 'needs-improvement';
  return 'poor';
}

function getFCPClass(fcp) {
  if (fcp <= 1800) return 'good';
  if (fcp <= 3000) return 'needs-improvement';
  return 'poor';
}

function getLCPClass(lcp) {
  if (lcp <= 2500) return 'good';
  if (lcp <= 4000) return 'needs-improvement';
  return 'poor';
}

function getCLSClass(cls) {
  if (cls <= 0.1) return 'good';
  if (cls <= 0.25) return 'needs-improvement';
  return 'poor';
}

function getTestType(result) {
  if (result.filename.includes('mobile')) return 'Mobile';
  if (result.filename.includes('device')) return 'Multi-Device';
  if (result.filename.includes('vitals')) return 'Core Web Vitals';
  if (result.filename.includes('network')) return 'Network';
  return 'Performance';
}

function getDevice(result) {
  if (result.device) return result.device;
  if (result.deviceConfig) return result.deviceConfig;
  return 'Unknown';
}

function getOverallStatus(result) {
  if (result.budgetCheck) {
    return result.budgetCheck.passed ? 'Passed' : 'Failed';
  }
  
  if (result.thresholds) {
    const passed = Object.values(result.thresholds).every(t => t.passed);
    return passed ? 'Passed' : 'Failed';
  }
  
  return 'Unknown';
}

// Export for use in other modules
export { generatePerformanceDashboard };