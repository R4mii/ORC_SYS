#!/usr/bin/env node
/**
 * Component Usage Analyzer
 * 
 * This script analyzes the codebase to detect which Radix UI components
 * are being used and which ones can be removed to optimize bundle size.
 * 
 * Usage:
 *   node scripts/analyze-components.js
 * 
 * Options:
 *   --verbose     Show detailed information about each file
 *   --json        Output results as JSON
 *   --output=path Specify output file path
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Directories to scan
  includeDirs: ['app', 'components', 'lib', 'pages'],
  // Directories to exclude
  excludeDirs: ['node_modules', '.next', 'dist', 'build', 'public'],
  // File extensions to analyze
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  // Package prefixes to track
  packagePrefixes: ['@radix-ui/react-'],
  // Cache file for previous results
  cacheFile: '.component-analysis-cache.json',
};

// Command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const outputJson = args.includes('--json');
const outputFileArg = args.find(arg => arg.startsWith('--output='));
const outputFile = outputFileArg ? outputFileArg.split('=')[1] : null;

// All Radix UI components
const radixPackages = [
  '@radix-ui/react-accordion',
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-avatar',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-collapsible',
  '@radix-ui/react-context-menu',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-hover-card',
  '@radix-ui/react-label',
  '@radix-ui/react-menubar',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-popover',
  '@radix-ui/react-progress',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-slider',
  '@radix-ui/react-slot',
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group',
  '@radix-ui/react-tooltip',
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// State to track component usage
const componentUsage = {
  packages: {},
  components: {},
  files: {},
  dynamicImports: [],
  lazyImports: [],
};

// Get installed package versions
function getInstalledPackages() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    return dependencies;
  } catch (error) {
    console.error(`${colors.red}Error reading package.json:${colors.reset}`, error.message);
    return {};
  }
}

// Initialize package tracking
function initializePackageTracking() {
  const installedPackages = getInstalledPackages();
  
  radixPackages.forEach(pkg => {
    componentUsage.packages[pkg] = {
      name: pkg,
      version: installedPackages[pkg] || 'Not installed',
      used: false,
      imports: [],
      components: {},
      size: 0,
    };
  });
}

// Recursively scan directories
function scanDirectories(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip excluded directories
      if (CONFIG.excludeDirs.includes(file)) {
        return;
      }
      
      // Recurse into subdirectories
      results = results.concat(scanDirectories(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      
      // Only process files with specified extensions
      if (CONFIG.extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  });
  
  return results;
}

// Extract imports from a file
function extractImports(filePath, content) {
  const fileInfo = {
    path: filePath,
    imports: [],
    dynamicImports: [],
    lazyImports: [],
  };
  
  // Regular expression for standard imports
  const importRegex = /import\s+(?:{([^}]+)}|([^;{]+))\s+from\s+['"]([^'"]+)['"]/g;
  
  // Regular expression for dynamic imports
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  // Regular expression for lazy imports
  const lazyImportRegex = /lazy\s*\(\s*(?:async\s*)?\(\s*\)\s*=>\s*import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  // Extract standard imports
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importedItems = match[1] ? match[1].trim() : match[2].trim();
    const packageName = match[3].trim();
    
    if (CONFIG.packagePrefixes.some(prefix => packageName.startsWith(prefix))) {
      const components = importedItems.split(',')
        .map(item => {
          // Handle destructuring with aliased imports: import { Root as Dialog } from '@radix-ui/react-dialog'
          const asMatch = item.match(/([^\s]+)\s+as\s+([^\s]+)/);
          if (asMatch) {
            return { original: asMatch[1].trim(), alias: asMatch[2].trim() };
          }
          return { original: item.trim(), alias: null };
        })
        .filter(item => item.original);
      
      fileInfo.imports.push({
        package: packageName,
        components,
      });
    }
  }
  
  // Extract dynamic imports
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    const packageName = match[1].trim();
    
    if (CONFIG.packagePrefixes.some(prefix => packageName.startsWith(prefix))) {
      fileInfo.dynamicImports.push(packageName);
      componentUsage.dynamicImports.push({
        file: filePath,
        package: packageName,
      });
    }
  }
  
  // Extract lazy imports
  while ((match = lazyImportRegex.exec(content)) !== null) {
    const packageName = match[1].trim();
    
    if (CONFIG.packagePrefixes.some(prefix => packageName.startsWith(prefix))) {
      fileInfo.lazyImports.push(packageName);
      componentUsage.lazyImports.push({
        file: filePath,
        package: packageName,
      });
    }
  }
  
  return fileInfo;
}

// Process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileInfo = extractImports(filePath, content);
    
    // Update component usage
    fileInfo.imports.forEach(({ package: packageName, components }) => {
      if (componentUsage.packages[packageName]) {
        // Mark package as used
        componentUsage.packages[packageName].used = true;
        
        // Track the file that imports this package
        if (!componentUsage.packages[packageName].imports.includes(filePath)) {
          componentUsage.packages[packageName].imports.push(filePath);
        }
        
        // Track individual components
        components.forEach(({ original, alias }) => {
          const componentName = alias || original;
          
          // Initialize component if not tracked yet
          if (!componentUsage.packages[packageName].components[original]) {
            componentUsage.packages[packageName].components[original] = {
              usages: [],
              aliases: new Set(),
            };
          }
          
          // Add file to component usages
          if (!componentUsage.packages[packageName].components[original].usages.includes(filePath)) {
            componentUsage.packages[packageName].components[original].usages.push(filePath);
          }
          
          // Track aliases
          if (alias) {
            componentUsage.packages[packageName].components[original].aliases.add(alias);
          }
          
          // Global component tracking
          if (!componentUsage.components[componentName]) {
            componentUsage.components[componentName] = {
              original,
              package: packageName,
              files: [],
            };
          }
          
          if (!componentUsage.components[componentName].files.includes(filePath)) {
            componentUsage.components[componentName].files.push(filePath);
          }
        });
      }
    });
    
    // Store file information
    componentUsage.files[filePath] = fileInfo;
    
    return fileInfo;
  } catch (error) {
    console.error(`${colors.red}Error processing file ${filePath}:${colors.reset}`, error.message);
    return null;
  }
}

// Calculate package sizes
function calculatePackageSizes() {
  try {
    for (const packageName of Object.keys(componentUsage.packages)) {
      // Use npm view to get the package size
      try {
        const sizeOutput = execSync(`npm view ${packageName} dist.size.uncompressed --json`, { encoding: 'utf8' });
        const size = JSON.parse(sizeOutput);
        componentUsage.packages[packageName].size = size;
      } catch (e) {
        // Fallback if npm view fails
        componentUsage.packages[packageName].size = 'Unknown';
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error calculating package sizes:${colors.reset}`, error.message);
  }
}

// Generate analysis report
function generateReport() {
  // Calculate totals
  const totalPackages = radixPackages.length;
  const usedPackages = Object.values(componentUsage.packages).filter(p => p.used).length;
  const unusedPackages = totalPackages - usedPackages;
  
  // Calculate potential savings
  let totalSize = 0;
  let unusedSize = 0;
  
  Object.values(componentUsage.packages).forEach(pkg => {
    if (typeof pkg.size === 'number') {
      totalSize += pkg.size;
      if (!pkg.used) {
        unusedSize += pkg.size;
      }
    }
  });
  
  // Build report object
  const report = {
    summary: {
      totalPackages,
      usedPackages,
      unusedPackages,
      totalSize: formatBytes(totalSize),
      potentialSavings: formatBytes(unusedSize),
      percentSavings: totalSize ? Math.round((unusedSize / totalSize) * 100) : 0,
      scannedFiles: Object.keys(componentUsage.files).length,
      dynamicImports: componentUsage.dynamicImports.length,
      lazyLoaded: componentUsage.lazyImports.length,
    },
    packages: {
      used: Object.values(componentUsage.packages)
        .filter(p => p.used)
        .map(p => ({
          name: p.name,
          version: p.version,
          components: Object.keys(p.components).length,
          size: typeof p.size === 'number' ? formatBytes(p.size) : p.size,
          files: p.imports.length,
        })),
      unused: Object.values(componentUsage.packages)
        .filter(p => !p.used)
        .map(p => ({
          name: p.name,
          version: p.version,
          size: typeof p.size === 'number' ? formatBytes(p.size) : p.size,
        })),
    },
    dynamicImports: componentUsage.dynamicImports,
    lazyImports: componentUsage.lazyImports,
    recommendations: [],
  };
  
  // Generate recommendations
  if (unusedPackages > 0) {
    report.recommendations.push({
      title: 'Remove unused Radix UI packages',
      description: `You can remove ${unusedPackages} unused Radix UI packages to save approximately ${formatBytes(unusedSize)}.`,
      packages: report.packages.unused.map(p => p.name),
    });
  }
  
  if (componentUsage.dynamicImports.length === 0 && componentUsage.lazyImports.length === 0) {
    report.recommendations.push({
      title: 'Implement code splitting',
      description: 'No dynamic or lazy imports were detected. Consider implementing code splitting to reduce your initial bundle size.',
    });
  }
  
  return report;
}

// Format file size in bytes to a human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return 'Unknown';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Print report to console
function printReport(report) {
  console.log('');
  console.log(`${

