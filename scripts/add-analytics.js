#!/usr/bin/env node

/**
 * Script to add Google Analytics script to all HTML files
 * This script scans all HTML files and adds analytics.js before </body>
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ANALYTICS_SCRIPT = '  <script src="/analytics.js"></script>';
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules and .git directories
            if (file !== 'node_modules' && file !== '.git' && file !== '.codebuddy') {
                findHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

/**
 * Add analytics script to HTML file if not already present
 */
function addAnalyticsToFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if analytics.js is already included
    if (content.includes('analytics.js')) {
        console.log(`✓ ${filePath} - Already has analytics`);
        return false;
    }

    // Add analytics script before </body>
    if (content.includes('</body>')) {
        content = content.replace('</body>', `${ANALYTICS_SCRIPT}\n</body>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ ${filePath} - Added analytics`);
        return true;
    } else {
        console.log(`⚠ ${filePath} - No </body> tag found`);
        return false;
    }
}

/**
 * Main execution
 */
function main() {
    console.log('🔍 Scanning for HTML files...\n');

    const htmlFiles = findHtmlFiles(PROJECT_ROOT);
    console.log(`Found ${htmlFiles.length} HTML files\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    htmlFiles.forEach(filePath => {
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        if (addAnalyticsToFile(filePath)) {
            updatedCount++;
        } else {
            skippedCount++;
        }
    });

    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updatedCount} files`);
    console.log(`   Skipped: ${skippedCount} files`);
    console.log(`   Total:   ${htmlFiles.length} files`);
}

main();
