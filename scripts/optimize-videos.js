#!/usr/bin/env node

/**
 * Video optimization script
 * This script helps create optimized video formats for faster loading
 * 
 * Prerequisites:
 * - Install FFmpeg: https://ffmpeg.org/download.html
 * - Run: npm install --save-dev child_process fs path
 * 
 * Usage:
 * node scripts/optimize-videos.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = 'public/videos';
const OUTPUT_DIR = 'public/videos/optimized';

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const optimizeVideo = (inputFile, outputName) => {
  const inputPath = path.join(INPUT_DIR, inputFile);
  const outputBaseName = path.join(OUTPUT_DIR, outputName);
  
  console.log(`Optimizing ${inputFile}...`);
  
  try {
    // Create WebM version (smaller, faster loading)
    console.log('Creating WebM version...');
    execSync(`ffmpeg -i "${inputPath}" -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus "${outputBaseName}.webm" -y`, {
      stdio: 'inherit'
    });
    
    // Create optimized MP4 version
    console.log('Creating optimized MP4 version...');
    execSync(`ffmpeg -i "${inputPath}" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k "${outputBaseName}.mp4" -y`, {
      stdio: 'inherit'
    });
    
    // Create mobile-optimized version (lower quality, smaller size)
    console.log('Creating mobile-optimized version...');
    execSync(`ffmpeg -i "${inputPath}" -c:v libx264 -crf 32 -preset fast -vf scale=720:-2 -c:a aac -b:a 96k "${outputBaseName}-mobile.mp4" -y`, {
      stdio: 'inherit'
    });
    
    console.log(`✅ Optimized ${inputFile} successfully!`);
    
  } catch (error) {
    console.error(`❌ Error optimizing ${inputFile}:`, error.message);
  }
};

// Optimize the sine video
optimizeVideo('sine1.mp4', 'sine1');

console.log('\n🎉 Video optimization complete!');
console.log('\nOptimized files created in:', OUTPUT_DIR);
console.log('\nTo use optimized videos, update your video sources to:');
console.log('- WebM: /videos/optimized/sine1.webm');
console.log('- MP4: /videos/optimized/sine1.mp4');
console.log('- Mobile: /videos/optimized/sine1-mobile.mp4');