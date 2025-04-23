#!/usr/bin/env node
/**
 * Component Optimization Script
 * 
 * This script uses the analyzer results to automatically optimize component imports
 * by converting direct imports to lazy-loaded versions and adding appropriate
 * loading states and error boundaries.
 * 
 * Usage:
 *   node scripts/optimize-components.js
 * 
 * Options:
 *   --dry-run     Show changes without actually applying them
 *   --component=name    Optimize only a specific component
 *   --verbose     Show detailed information
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // Analysis results file path
  analysisFile: 'component-analysis.json',
  
  // Directories to scan for optimization
  includeDirs: ['app', 'components', 'lib', 'pages'],
  
  // Directories to exclude
  excludeDirs: ['node_modules', '.next', 'dist', 'build', 'public', 'components/ui/lazy'],
  
  // File extensions to analyze
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  
  // Package prefixes to track
  packagePrefixes: ['@radix-ui/react-'],
  
  // Base directory for lazy components
  lazyComponentsDir: 'components/ui/lazy',
  
  // Import prefix for lazy components
  lazyImportPrefix: '@/components/ui/lazy',
};

// Command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const componentArg = args.find(arg => arg.startsWith('--component='));
const specificComponent = componentArg ? componentArg.split('=')[1] : null;

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

// Load analysis results
function loadAnalysisResults() {
  try {
    if (!fs.existsSync(CONFIG.analysisFile)) {
      console.error(`${colors.red}Analysis file not found: ${CONFIG.analysisFile}${colors.reset}`);
      console.error(`${colors.yellow}Please run 'npm run analyze:components:json' first.${colors.reset}`);
      process.exit(1);
    }
    
    const analysisJson = fs.readFileSync(CONFIG.analysisFile, 'utf8');
    return JSON.parse(analysisJson);
  } catch (error) {
    console.error(`${colors.red}Error loading analysis results:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Get optimization targets from analysis results
function getOptimizationTargets(analysis) {
  // Start with components specifically recommended for lazy loading
  const targets = new Set();
  const packageComponentMap = new Map();
  
  // First, find components specifically recommended for lazy loading
  analysis.recommendations.forEach(rec => {
    if (rec.title.includes('lazy loading') && rec.components) {
      rec.components.forEach(component => {
        targets.add(component.name);
        
        if (component.package) {
          if (!packageComponentMap.has(component.package)) {
            packageComponentMap.set(component.package, new Set());
          }
          packageComponentMap.get(component.package).add(component.name);
        }
      });
    }
  });
  
  // Then add all frequently used components
  Object.entries(analysis.components || {}).forEach(([componentName, component]) => {
    if (component.files && component.files.length >= 3) {
      targets.add(componentName);
      
      if (component.package) {
        if (!packageComponentMap.has(component.package)) {
          packageComponentMap.set(component.package, new Set());
        }
        packageComponentMap.get(component.package).add(componentName);
      }
    }
  });
  
  // If a specific component was requested, filter to just that one
  if (specificComponent) {
    if (targets.has(specificComponent)) {
      targets.clear();
      targets.add(specificComponent);
      
      // Also filter packageComponentMap
      for (const [pkg, components] of packageComponentMap.entries()) {
        if (components.has(specificComponent)) {
          packageComponentMap.set(pkg, new Set([specificComponent]));
        } else {
          packageComponentMap.delete(pkg);
        }
      }
    } else {
      console.warn(`${colors.yellow}Warning: Specified component '${specificComponent}' not found in optimization targets.${colors.reset}`);
    }
  }
  
  return {
    components: Array.from(targets),
    packageMap: Object.fromEntries(Array.from(packageComponentMap.entries())
      .map(([pkg, components]) => [pkg, Array.from(components)]))
  };
}

// Check if lazy component implementation already exists
function checkExistingLazyComponent(componentName) {
  const possiblePaths = [
    path.join(CONFIG.lazyComponentsDir, `${componentName.toLowerCase()}.tsx`),
    path.join(CONFIG.lazyComponentsDir, `${componentName.toLowerCase()}.ts`),
    path.join(CONFIG.lazyComponentsDir, `${componentName.toLowerCase()}.jsx`),
    path.join(CONFIG.lazyComponentsDir, `${componentName.toLowerCase()}.js`),
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return {
        exists: true,
        path: filePath
      };
    }
  }
  
  return {
    exists: false,
    path: path.join(CONFIG.lazyComponentsDir, `${componentName.toLowerCase()}.tsx`)
  };
}

// Check if a component is already exported from the lazy index file
function isComponentExportedFromLazyIndex(componentName) {
  const indexPath = path.join(CONFIG.lazyComponentsDir, 'index.ts');
  
  if (!fs.existsSync(indexPath)) {
    return false;
  }
  
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const exportRegex = new RegExp(`export\\s+(?:\\*|{[^}]*${componentName}[^}]*})\\s+from`);
  
  return exportRegex.test(indexContent);
}

// Create a lazy component implementation
function createLazyComponent(componentName, packageName, components) {
  const lazyInfo = checkExistingLazyComponent(componentName);
  
  if (lazyInfo.exists) {
    if (verbose) {
      console.log(`${colors.dim}Lazy component already exists: ${lazyInfo.path}${colors.reset}`);
    }
    return lazyInfo.path;
  }
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(CONFIG.lazyComponentsDir)) {
    fs.mkdirSync(CONFIG.lazyComponentsDir, { recursive: true });
  }
  
  // Generate the component file content
  const componentNameLower = componentName.toLowerCase();
  let content = 
`import * as React from "react"
import { createLazyComponentBatch } from "../lazy-component"
import { getOptimizedLazyOptions } from "../lazy-component-analyzer"

/**
 * Lazy loaded ${componentName} components from ${packageName}
 * 
 * These components are loaded only when they are rendered, which improves initial
 * page load performance. They include Suspense boundaries for loading states
 * and Error boundaries for error handling.
 */
`;

  // Create component export mapping
  const componentMap = {};
  components.forEach(comp => {
    // For common Radix patterns, map to Root, Trigger, etc.
    // This is a simplification; in a real system we'd need to inspect each package's exports
    componentMap[comp] = comp.replace(componentName, '').trim() || 'Root'; 
  });

  // Add the component batch creation
  content += `
const {
  ${components.join(',\n  ')}
} = createLazyComponentBatch({
  module: "${packageName}",
  components: {
    ${components.map(comp => `${comp}: "${componentMap[comp]}"`).join(',\n    ')}
  },
  defaultOptions: getOptimizedLazyOptions("${packageName}", "", {
    withErrorBoundary: true,
    fallback: <div className="p-4 animate-pulse bg-muted rounded-md">Loading ${componentName}...</div>,
    errorFallback: (error) => (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="text-red-800 font-semibold">Failed to load ${componentName} component</h3>
        <p className="text-red-600 text-sm">{error.message}</p>
      </div>
    ),
    preload: false
  })
});

/**
 * Preload all ${componentName} components
 * Can be called to eagerly load all ${componentName} components
 */
export function preload${componentName}Components() {
  return Promise.all([
    ${components.map(comp => `${comp}.preload()`).join(',\n    ')}
  ]);
}

export {
  ${components.join(',\n  ')}
}
`;

  // Write the file
  if (!dryRun) {
    fs.writeFileSync(lazyInfo.path, content, 'utf8');
    console.log(`${colors.green}Created lazy component: ${lazyInfo.path}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Would create lazy component: ${lazyInfo.path}${colors.reset}`);
  }

  return lazyInfo.path;
}

// Update or create the lazy component index file
function updateLazyComponentIndex(componentName, filePath) {
  const indexPath = path.join(CONFIG.lazyComponentsDir, 'index.ts');
  
  // If it's already exported, we're done
  if (isComponentExportedFromLazyIndex(componentName)) {
    if (verbose) {
      console.log(`${colors.dim}Component already exported from index: ${componentName}${colors.reset}`);
    }
    return;
  }
  
  let content = '';
  
  // Create the file if it doesn't exist
  if (!fs.existsSync(indexPath)) {
    content = 
`/**
 * Lazy-loaded UI components
 * 
 * This barrel file exports all lazy-loaded components to simplify imports.
 * Components are loaded on-demand, which improves initial load performance.
 */

`;
  } else {
    content = fs.readFileSync(indexPath, 'utf8');
  }
  
  // Get relative path from index to component file
  const relativePath = './' + path.relative(
    path.dirname(indexPath),
    filePath
  ).replace(/\\/g, '/').replace(/\.[^/.]+$/, '');
  
  // Add the export if not already present
  if (!content.includes(`from "${relativePath}"`)) {
    content += `export * from "${relativePath}"\n`;
    
    if (!dryRun) {
      fs.writeFileSync(indexPath, content, 'utf8');
      console.log(`${colors.green}Updated index file to export ${componentName}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}Would update index file to export ${componentName}${colors.reset}`);
    }
  }
}

// Recursively scan directories for files to optimize
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

// Update imports in a file to use lazy versions
function updateFileImports(filePath, targets) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Regular expression for finding imports
  const importRegex = /import\s+(?:{([^}]+)}|([^;{]+))\s+from\s+['"]([^'"]+)['"]/g;
  
  // Track replaced components to avoid duplicates
  const replacedComponents = new Set();
  
  // Find all imports
  let match;
  let imports = [];
  while ((match = importRegex.exec(content)) !== null) {
    const importedItems = match[1] ? match[1].trim() : match[2].trim();
    const packageName = match[3].trim();
    
    if (CONFIG.packagePrefixes.some(prefix => packageName.startsWith(prefix))) {
      imports.push({
        fullMatch: match[0],
        importedItems,
        packageName,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
  }
  
  // Process imports in reverse order to avoid index shifting
  imports.sort((a, b) => b.startIndex - a.startIndex);
  
  for (const imp of imports) {
    const { fullMatch, importedItems, packageName, startIndex, endIndex } = imp;
    
    // Skip if no components from this package are targets
    if (!targets.packageMap[packageName]) {
      continue;
    }
    
    // Parse the imported components
    const components = importedItems.split(',')
      .map(item => {
        // Handle destructuring with aliased imports
        const asMatch = item.match(/([^\s]+)\s+as\s+([^\s]+)/);
        if (asMatch) {
          return { 
            original: asMatch[1].trim(), 
            alias: asMatch[2].trim(),
            full: item.trim()
          };
        }
        return { 
          original: item.trim(), 
          alias: null,
          full: item.trim()
        };
      })
      .filter(item => item.original);
    
    // Find components that need to be replaced
    const componentsToReplace = components.filter(component => 
      targets.packageMap[packageName].includes(component.original) ||
      targets.packageMap[packageName].includes(component.alias || component.original)
    );
    
    if (componentsToReplace.length > 0) {
      // Check what components are left (not replaced)
      const remainingComponents = components.filter(component => 
        !componentsToReplace.some(c => c.original === component.original)
      );
      
      // Create the new imports
      let newContent = content;
      
      // First, remove the old import statement
      newContent = newContent.slice(0, startIndex) + newContent.slice(endIndex);
      
      // Keep track of the offset after removing the original import
      let offset = startIndex - endIndex;
      
      // Add the lazy component import if needed
      const lazyComponentNames = componentsToReplace.map(c => c.alias || c.original);
      
      if (lazyComponentNames.length > 0) {
        // Determine the component group name (e.g., "Dialog" from DialogTrigger, DialogContent, etc.)
        // This is a simplification; in a real system we'd need to be more sophisticated
        const groupName = getComponentGroupName(packageName, lazyComponentNames);
        
        // Create the lazy import statement
        const lazyImport = `import { ${lazyComponentNames.join(', ')} } from "${CONFIG.lazyImportPrefix}"`;
        
        // Insert the new import at the same position
        newContent = newContent.slice(0, startIndex + offset) + lazyImport + newContent.slice(startIndex + offset);
        
        // Update the offset
        offset += lazyImport.length;
        
        // Track the components that were replaced
        lazyComponentNames.forEach(name => replacedComponents.add(name));
        
        // Flag that the file was modified
        modified = true;
      }
      
      // Add remaining original imports if needed
      if (remainingComponents.length > 0) {
        const remainingImport = `import { ${remainingComponents.map(c => c.full).join(', ')} } from "${packageName}"`;
        
        // Insert the remaining import statement
        newContent = newContent.slice(0, startIndex + offset) + remainingImport + newContent.slice(startIndex + offset);
        
        // Update the offset
        offset += remainingImport.length;
      }
      
      // Update the content if modified
      if (modified) {
        content = newContent;
      }
    }
  }
  
  // Add necessary React imports for Suspense if we've modified any imports
  if (modified && replacedComponents.size > 0) {
    // Check if we need to add React Suspense import
    if (!content.includes('import { Suspense }') && !content.includes('import React, {')) {
      // Check for existing React import
      const reactImportRegex = /import\s+(\*\s+as\s+)?React\s+from\s+['"]react['"]/;
      const reactImportMatch = reactImportRegex.exec(content);
      
      if (reactImportMatch) {
        // Modify existing React import to include Suspense
        const originalImport = reactImportMatch[0];
        const newImport = originalImport.replace('import React', 'import React, { Suspense }');
        content = content.replace(originalImport, newImport);
      } else {
        // Add new React+Suspense import at the top
        content = `import React, { Suspense } from 'react';\n${content}`;
      }
    }
    
    // Try to wrap component usage in Suspense boundaries
    // This is a simplification - in a real system we would need more sophisticated AST parsing
    if (replacedComponents.size > 0) {
      content = addSuspenseBoundaries(content, Array.from(replacedComponents));
    }
  }
  
  if (modified) {
    if (!dryRun) {
      // Backup the original file
      backupFile(filePath);
      
      // Write the modified content
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`${colors.green}Updated imports in ${filePath}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}Would update imports in ${filePath}${colors.reset}`);
    }
    
    return true;
  }
  
  return false;
}

// Analyze the component names to determine the component group name
function getComponentGroupName(packageName, componentNames) {
  // Extract the component type from the package name (e.g., "dialog" from "@radix-ui/react-dialog")
  const packageMatch = packageName.match(/@radix-ui\/react-([a-z-]+)/);
  if (packageMatch) {
    return packageMatch[1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }
  
  // Try to extract group name from component names (e.g., "Dialog" from "DialogTrigger")
  const commonPrefix = findCommonPrefix(componentNames);
  if (commonPrefix && commonPrefix.length > 0) {
    return commonPrefix;
  }
  
  // Fallback to the first component name
  return componentNames[0];
}

// Find common prefix among component names (e.g., "Dialog" from "DialogTrigger", "DialogContent")
function findCommonPrefix(componentNames) {
  if (componentNames.length <= 1) {
    return componentNames[0];
  }
  
  // Helper function to find common prefix of two strings
  const commonPrefixOfTwo = (a, b) => {
    const minLength = Math.min(a.length, b.length);
    let i = 0;
    while (i < minLength && a.charAt(i) === b.charAt(i)) {
      i++;
    }
    return a.substring(0, i);
  };
  
  // Start with the first component name
  let prefix = componentNames[0];
  
  // Iteratively find common prefix with other component names
  for (let i = 1; i < componentNames.length; i++) {
    prefix = commonPrefixOfTwo(prefix, componentNames[i]);
    if (prefix.length === 0) {
      break;
    }
  }
  
  return prefix;
}

// Add Suspense boundaries around component usage
function addSuspenseBoundaries(content, componentNames) {
  let modifiedContent = content;
  
  // This is a very basic approach. A proper implementation would use AST parsing.
  // We're looking for usage patterns like <ComponentName ...> or <ComponentName/>
  componentNames.forEach(componentName => {
    // Create regex patterns to find component usage
    const selfClosingPattern = new RegExp(`<${componentName}([^>]*?)\\s*\\/\\s*>`, 'g');
    const openingPattern = new RegExp(`<${componentName}([^>]*?)>`, 'g');
    const closingPattern = new RegExp(`<\\/${componentName}\\s*>`, 'g');
    
    // Track positions of the components
    const positions = [];
    
    // Find self-closing tags (e.g., <Component />)
    let match;
    while ((match = selfClosingPattern.exec(modifiedContent)) !== null) {
      positions.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'self-closing',
        attrs: match[1] || '',
        original: match[0]
      });
    }
    
    // Find opening and closing tag pairs (e.g., <Component>...</Component>)
    const openTags = [];
    while ((match = openingPattern.exec(modifiedContent)) !== null) {
      openTags.push({
        index: match.index,
        attrs: match[1] || '',
        original: match[0]
      });
    }
    
    const closeTags = [];
    while ((match = closingPattern.exec(modifiedContent)) !== null) {
      closeTags.push({
        index: match.index,
        original: match[0]
      });
    }
    
    // Match opening and closing tags
    if (openTags.length > 0 && openTags.length === closeTags.length) {
      // Sort by position
      openTags.sort((a, b) => a.index - b.index);
      closeTags.sort((a, b) => a.index - b.index);
      
      // Create pairs
      for (let i = 0; i < openTags.length; i++) {
        positions.push({
          start: openTags[i].index,
          end: closeTags[i].index + closeTags[i].original.length,
          type: 'open-close',
          attrs: openTags[i].attrs,
          originalOpen: openTags[i].original,
          originalClose: closeTags[i].original
        });
      }
    }
    
    // Sort positions in reverse order to avoid index shifting when modifying the content
    positions.sort((a, b) => b.start - a.start);
    
    // Wrap components in Suspense boundaries
    positions.forEach(pos => {
      const componentContent = modifiedContent.substring(pos.start, pos.end);
      
      // Create the suspense wrapper
      const suspenseWrapper = 
        `<Suspense fallback={<div className="p-4 animate-pulse bg-muted rounded-md">Loading ${componentName}...</div>}>
  ${componentContent}
</Suspense>`;
      
      // Replace the component with the wrapped version
      modifiedContent = modifiedContent.substring(0, pos.start) + suspenseWrapper + modifiedContent.substring(pos.end);
    });
  });
  
  return modifiedContent;
}

// Back up a file before modifying it
function backupFile(filePath) {
  const backupDir = path.join(path.dirname(filePath), '.backups');
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupFilename = `${path.basename(filePath)}.${timestamp}.bak`;
  const backupPath = path.join(backupDir, backupFilename);
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Copy the original file to the backup location
  fs.copyFileSync(filePath, backupPath);
  
  if (verbose) {
    console.log(`${colors.dim}Created backup: ${backupPath}${colors.reset}`);
  }
}

// Create necessary lazy components
function createLazyComponents(targets) {
  console.log(`${colors.blue}Creating lazy components...${colors.reset}`);
  const componentFiles = {};
  
  // Group components by their group name
  const componentGroups = {};
  
  Object.entries(targets.packageMap).forEach(([packageName, components]) => {
    components.forEach(componentName => {
      // Determine the component group
      const groupName = getComponentGroupName(packageName, [componentName]);
      
      if (!componentGroups[groupName]) {
        componentGroups[groupName] = {
          package: packageName,
          components: []
        };
      }
      
      componentGroups[groupName].components.push(componentName);
    });
  });
  
  // Create lazy components for each group
  Object.entries(componentGroups).forEach(([groupName, group]) => {
    console.log(`${colors.dim}Creating lazy component for ${groupName}...${colors.reset}`);
    const filePath = createLazyComponent(groupName, group.package, group.components);
    componentFiles[groupName] = filePath;
    
    // Update the index file
    updateLazyComponentIndex(groupName, filePath);
  });
  
  return componentFiles;
}

// Main function to optimize component imports
function optimizeComponents() {
  console.log(`${colors.blue}Starting component optimization...${colors.reset}`);
  
  try {
    // Load analysis results
    const analysis = loadAnalysisResults();
    
    // Get optimization targets
    const targets = getOptimizationTargets(analysis);
    
    if (targets.components.length === 0) {
      console.log(`${colors.yellow}No components found for optimization.${colors.reset}`);
      return;
    }
    
    console.log(`${colors.green}Found ${targets.components.length} components to optimize:${colors.reset}`);
    targets.components.forEach(comp => {
      console.log(`• ${colors.cyan}${comp}${colors.reset}`);
    });
    console.log('');
    
    // Create lazy components for each target
    console.log(`${colors.blue}Step 1: Creating lazy component implementations${colors.reset}`);
    const componentFiles = createLazyComponents(targets);
    console.log('');
    
    // Scan for files to update
    console.log(`${colors.blue}Step 2: Updating component imports${colors.reset}`);
    const files = [];
    CONFIG.includeDirs.forEach(dir => {
      console.log(`${colors.dim}Scanning directory: ${dir}${colors.reset}`);
      files.push(...scanDirectories(dir));
    });
    
    console.log(`${colors.dim}Found ${files.length} files to analyze${colors.reset}`);
    
    // Update imports in files
    console.log(`${colors.blue}Step 3: Updating import statements${colors.reset}`);
    let updatedFiles = 0;
    let processedFiles = 0;
    
    files.forEach(file => {
      processedFiles++;
      if (processedFiles % 10 === 0 || processedFiles === files.length) {
        process.stdout.write(`${colors.dim}Processing files... ${processedFiles}/${files.length}\r${colors.reset}`);
      }
      
      try {
        const updated = updateFileImports(file, targets);
        if (updated) {
          updatedFiles++;
        }
      } catch (error) {
        console.error(`${colors.red}Error updating file ${file}:${colors.reset}`, error.message);
      }
    });
    
    console.log('');
    console.log(`${colors.green}Optimization complete!${colors.reset}`);
    console.log(`• Created ${Object.keys(componentFiles).length} lazy component implementations`);
    console.log(`• Updated ${updatedFiles} files to use lazy loading`);
    console.log(`• Processed ${processedFiles} total files`);
    
    if (dryRun) {
      console.log(`${colors.yellow}Note: This was a dry run. No files were actually modified.${colors.reset}`);
      console.log(`Run without --dry-run to apply the changes.`);
    }
  } catch (error) {
    console.error(`${colors.red}Optimization failed:${colors.reset}`, error);
    process.exit(1);
  }
}

// Main execution
try {
  optimizeComponents();
} catch (error

