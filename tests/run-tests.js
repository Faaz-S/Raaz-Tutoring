#!/usr/bin/env node

/**
 * Test runner for visual regression and performance tests
 */

import { spawn } from 'child_process';
import { generatePerformanceDashboard } from './performance/performance-dashboard.js';

const args = process.argv.slice(2);
const testType = args[0] || 'all';

const commands = {
  visual: 'npm run test:visual',
  performance: 'npm run test:performance',
  lighthouse: 'npm run test:lighthouse',
  all: 'npm run test:all'
};

async function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    
    const [cmd, ...cmdArgs] = command.split(' ');
    const child = spawn(cmd, cmdArgs, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

async function main() {
  try {
    console.log(`Starting ${testType} tests...`);
    
    if (testType === 'all') {
      // Run all tests sequentially
      await runCommand(commands.visual);
      await runCommand(commands.performance);
      await runCommand(commands.lighthouse);
    } else if (commands[testType]) {
      await runCommand(commands[testType]);
    } else {
      console.error(`Unknown test type: ${testType}`);
      console.log('Available types: visual, performance, lighthouse, all');
      process.exit(1);
    }
    
    // Generate performance dashboard if performance tests were run
    if (testType === 'performance' || testType === 'all') {
      console.log('Generating performance dashboard...');
      try {
        await generatePerformanceDashboard();
        console.log('Performance dashboard generated successfully');
      } catch (error) {
        console.warn('Failed to generate performance dashboard:', error.message);
      }
    }
    
    console.log(`${testType} tests completed successfully!`);
    
  } catch (error) {
    console.error(`Tests failed:`, error.message);
    process.exit(1);
  }
}

main();