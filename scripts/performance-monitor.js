// Performance monitoring script
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runPerformanceAudit() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
  };
  
  const urls = [
    'http://localhost:3000',
    'http://localhost:3000/admin/dashboard',
    'http://localhost:3000/student/dashboard',
    'http://localhost:3000/faculty/dashboard',
  ];
  
  const results = {};
  
  for (const url of urls) {
    console.log(`Auditing ${url}...`);
    try {
      const runnerResult = await lighthouse(url, options);
      const score = runnerResult.lhr.categories.performance.score * 100;
      const metrics = runnerResult.lhr.audits;
      
      results[url] = {
        score,
        firstContentfulPaint: metrics['first-contentful-paint'].numericValue,
        largestContentfulPaint: metrics['largest-contentful-paint'].numericValue,
        timeToInteractive: metrics['interactive'].numericValue,
        cumulativeLayoutShift: metrics['cumulative-layout-shift'].numericValue,
        totalBlockingTime: metrics['total-blocking-time'].numericValue,
      };
      
      console.log(`${url}: Performance Score ${score}`);
    } catch (error) {
      console.error(`Error auditing ${url}:`, error.message);
    }
  }
  
  await chrome.kill();
  
  // Save results
  const reportPath = path.join(process.cwd(), 'performance-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log('\n📊 Performance Audit Complete!');
  console.log(`Results saved to: ${reportPath}`);
  
  // Generate summary
  console.log('\n📈 Performance Summary:');
  Object.entries(results).forEach(([url, metrics]) => {
    console.log(`\n${url}:`);
    console.log(`  Performance Score: ${metrics.score}/100`);
    console.log(`  FCP: ${(metrics.firstContentfulPaint / 1000).toFixed(2)}s`);
    console.log(`  LCP: ${(metrics.largestContentfulPaint / 1000).toFixed(2)}s`);
    console.log(`  TTI: ${(metrics.timeToInteractive / 1000).toFixed(2)}s`);
    console.log(`  CLS: ${metrics.cumulativeLayoutShift.toFixed(3)}`);
    console.log(`  TBT: ${metrics.totalBlockingTime.toFixed(0)}ms`);
  });
}

// Bundle size analysis
function analyzeBundleSize() {
  const buildDir = path.join(process.cwd(), '.next');
  const staticDir = path.join(buildDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.log('Build directory not found. Run "npm run build" first.');
    return;
  }
  
  console.log('\n📦 Bundle Size Analysis:');
  
  // Analyze JavaScript bundles
  const jsDir = path.join(staticDir, 'chunks');
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    let totalJSSize = 0;
    
    jsFiles.forEach(file => {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalJSSize += stats.size;
      
      if (stats.size > 100 * 1024) { // Show files larger than 100KB
        console.log(`  ${file}: ${sizeKB} KB`);
      }
    });
    
    console.log(`\nTotal JS Bundle Size: ${(totalJSSize / 1024 / 1024).toFixed(2)} MB`);
  }
  
  // Analyze CSS bundles
  const cssDir = path.join(staticDir, 'css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    let totalCSSSize = 0;
    
    cssFiles.forEach(file => {
      const filePath = path.join(cssDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalCSSSize += stats.size;
      console.log(`  ${file}: ${sizeKB} KB`);
    });
    
    console.log(`\nTotal CSS Bundle Size: ${(totalCSSSize / 1024).toFixed(2)} KB`);
  }
}

// Main execution
async function main() {
  console.log('🔍 Starting Performance Audit...\n');
  
  try {
    await runPerformanceAudit();
    analyzeBundleSize();
    
    console.log('\n✅ Performance audit completed successfully!');
    console.log('\n💡 Recommendations:');
    console.log('  1. Optimize images with WebP format');
    console.log('  2. Implement code splitting for large components');
    console.log('  3. Add service worker for caching');
    console.log('  4. Minimize unused CSS and JavaScript');
    console.log('  5. Optimize third-party scripts');
    
  } catch (error) {
    console.error('❌ Performance audit failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runPerformanceAudit, analyzeBundleSize };