/**
 * Vite plugin for critical CSS extraction and optimization
 */
import fs from 'fs';
import path from 'path';

export function criticalCSSPlugin(options = {}) {
  const {
    criticalPath = 'src/utils/criticalCSS.js',
    inlineThreshold = 14 * 1024, // 14KB threshold for inlining
    generateReport = false
  } = options;

  return {
    name: 'critical-css',
    apply: 'build',
    
    generateBundle(options, bundle) {
      // Extract critical CSS from the bundle
      const criticalCSSContent = getCriticalCSS();
      
      // Find the main HTML file
      const htmlFiles = Object.keys(bundle).filter(fileName => fileName.endsWith('.html'));
      
      htmlFiles.forEach(fileName => {
        const htmlBundle = bundle[fileName];
        if (htmlBundle.type === 'asset' && typeof htmlBundle.source === 'string') {
          // Inject critical CSS into HTML
          const updatedHTML = injectCriticalCSS(htmlBundle.source, criticalCSSContent);
          htmlBundle.source = updatedHTML;
        }
      });
      
      if (generateReport) {
        generatePerformanceReport(bundle);
      }
    }
  };

  function getCriticalCSS() {
    try {
      const criticalPath = path.resolve('src/utils/criticalCSS.js');
      const content = fs.readFileSync(criticalPath, 'utf-8');
      
      // Extract the CSS string from the export
      const match = content.match(/export const criticalCSS = `([\s\S]*?)`;/);
      return match ? match[1] : '';
    } catch (error) {
      console.warn('Could not extract critical CSS:', error.message);
      return '';
    }
  }
  
  function injectCriticalCSS(html, criticalCSS) {
    if (!criticalCSS) return html;
    
    // Create the critical CSS style tag
    const criticalStyleTag = `<style id="critical-css">${criticalCSS}</style>`;
    
    // Inject before the first stylesheet or at the end of head
    const headEndIndex = html.indexOf('</head>');
    if (headEndIndex !== -1) {
      return html.slice(0, headEndIndex) + criticalStyleTag + html.slice(headEndIndex);
    }
    
    return html;
  }
  
  function generatePerformanceReport(bundle) {
    const report = {
      timestamp: new Date().toISOString(),
      criticalCSSSize: 0,
      totalCSSSize: 0,
      jsSize: 0,
      htmlSize: 0,
      assets: []
    };
    
    Object.entries(bundle).forEach(([fileName, asset]) => {
      let size = 0;
      if (asset.source) {
        size = typeof asset.source === 'string' 
          ? Buffer.byteLength(asset.source, 'utf8')
          : asset.source.length;
      } else if (asset.code) {
        size = Buffer.byteLength(asset.code, 'utf8');
      }
        
      report.assets.push({
        fileName,
        size,
        type: asset.type
      });
      
      if (fileName.endsWith('.css')) {
        report.totalCSSSize += size;
      } else if (fileName.endsWith('.js')) {
        report.jsSize += size;
      } else if (fileName.endsWith('.html')) {
        report.htmlSize += size;
      }
    });
    
    // Write performance report
    fs.writeFileSync(
      'dist/performance-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('📊 Performance Report Generated:');
    console.log(`   Total CSS: ${(report.totalCSSSize / 1024).toFixed(2)}KB`);
    console.log(`   Total JS: ${(report.jsSize / 1024).toFixed(2)}KB`);
    console.log(`   HTML: ${(report.htmlSize / 1024).toFixed(2)}KB`);
  }
}