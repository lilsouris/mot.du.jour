#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting code cleanup and quality check...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n${colors.blue}${description}...${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, 'green');
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    throw error;
  }
}

function cleanBuildArtifacts() {
  log('\n🧹 Cleaning build artifacts...', 'blue');

  const dirsToClean = ['.next', 'out', 'dist', 'build', 'node_modules/.cache'];

  dirsToClean.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        log(`  Removed ${dir}`, 'green');
      } catch (error) {
        log(`  Warning: Could not remove ${dir}`, 'yellow');
      }
    }
  });
}

function checkDependencies() {
  log('\n📦 Checking dependencies...', 'blue');

  try {
    execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
    log('✅ No critical security vulnerabilities found', 'green');
  } catch (error) {
    log(
      '⚠️  Security vulnerabilities found. Run "npm audit fix" to fix them.',
      'yellow'
    );
  }
}

function main() {
  try {
    // Clean build artifacts
    cleanBuildArtifacts();

    // Install dependencies
    runCommand('npm install', 'Installing dependencies');

    // Type checking
    runCommand('npm run type-check', 'Type checking');

    // Linting
    runCommand('npm run lint:fix', 'Fixing linting issues');

    // Formatting
    runCommand('npm run format', 'Formatting code');

    // Final check
    runCommand('npm run check', 'Final quality check');

    // Check dependencies
    checkDependencies();

    log('\n🎉 Code cleanup and quality check completed successfully!', 'green');
    log('\n📋 Summary of what was done:', 'bold');
    log('  • Cleaned build artifacts (.next, out, dist, build)');
    log('  • Installed/updated dependencies');
    log('  • Fixed TypeScript type errors');
    log('  • Fixed ESLint issues');
    log('  • Formatted code with Prettier');
    log('  • Ran final quality checks');
    log('  • Checked for security vulnerabilities');

    log('\n💡 Available commands:', 'bold');
    log('  • npm run check    - Run all quality checks');
    log('  • npm run fix      - Fix linting and formatting issues');
    log('  • npm run clean    - Clean build artifacts');
    log('  • npm run lint     - Run ESLint');
    log('  • npm run format   - Format code with Prettier');
  } catch (error) {
    log(
      '\n❌ Code cleanup failed. Please fix the errors above and try again.',
      'red'
    );
    process.exit(1);
  }
}

main();
