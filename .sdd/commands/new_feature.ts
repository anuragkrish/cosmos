#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Specification-Driven Development: New Feature Command
 * Creates a new feature following SDD principles
 */

interface FeatureMetadata {
  title: string;
  version: string;
  date: string;
  author: string;
  status: 'Draft' | 'In Review' | 'Approved' | 'Implemented';
  type: 'feature-specification';
  tags: string[];
  reviewers: string[];
  approvers: string[];
  related_specs: string[];
}

function createNewFeature(featureName: string): void {
  if (!featureName) {
    console.error('Usage: tsx .sdd/commands/new_feature.ts <feature-name>');
    process.exit(1);
  }

  const specDir = path.join('.sdd', 'specs');
  const branchName = `feature/${featureName}`;
  const specFile = path.join(specDir, `${featureName}.md`);
  
  // Ensure specs directory exists
  if (!fs.existsSync(specDir)) {
    fs.mkdirSync(specDir, { recursive: true });
  }

  // Check if feature already exists
  if (fs.existsSync(specFile)) {
    console.error(`Feature specification already exists: ${specFile}`);
    process.exit(1);
  }

  // Read template
  const templatePath = path.join('.sdd', 'templates', 'feature-spec.md');
  if (!fs.existsSync(templatePath)) {
    console.error('Feature specification template not found. Run setup first.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  
  // Create metadata
  const metadata: FeatureMetadata = {
    title: featureName,
    version: '1.0',
    date: new Date().toISOString().split('T')[0],
    author: getCurrentUser(),
    status: 'Draft',
    type: 'feature-specification',
    tags: [],
    reviewers: [],
    approvers: [],
    related_specs: []
  };

  // Replace template placeholders
  const specContent = template
    .replace(/\[Brief, descriptive name\]/g, featureName)
    .replace(/\[Creation date\]/g, metadata.date)
    .replace(/\[Primary author\/team\]/g, metadata.author);

  // Write specification
  fs.writeFileSync(specFile, specContent);

  // Create feature branch
  try {
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    console.log(`✅ Created branch: ${branchName}`);
  } catch (error) {
    console.warn('⚠️  Could not create git branch. Continue manually.');
  }

  console.log(`✅ Created feature specification: ${specFile}`);
  console.log(`📝 Edit the specification file to define your feature`);
  console.log(`⚠️  IMPORTANT: Verify eevee-ds MCP availability before any UI component work`);
  console.log(`🔄 Run 'tsx .sdd/commands/generate_plan.ts ${featureName}' when specification is complete`);

  // Create lib directory structure following Article I
  const libDir = path.join('src', 'lib', featureName);
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
    
    // Create basic library structure
    const indexContent = `/**
 * ${featureName} Library
 * Following Article I: Library-First Principle
 */

export * from './types';
export * from './core';
`;
    
    const typesContent = `/**
 * ${featureName} Types
 */

// Define your types here
export interface ${toPascalCase(featureName)}Config {
  // Add configuration options
}

export interface ${toPascalCase(featureName)}Result {
  // Define result structure
}
`;

    const coreContent = `/**
 * ${featureName} Core Implementation
 */

import type { ${toPascalCase(featureName)}Config, ${toPascalCase(featureName)}Result } from './types';

export class ${toPascalCase(featureName)} {
  constructor(private config: ${toPascalCase(featureName)}Config) {}

  // Implement core functionality here
  execute(): ${toPascalCase(featureName)}Result {
    throw new Error('Not implemented yet');
  }
}
`;

    fs.writeFileSync(path.join(libDir, 'index.ts'), indexContent);
    fs.writeFileSync(path.join(libDir, 'types.ts'), typesContent);
    fs.writeFileSync(path.join(libDir, 'core.ts'), coreContent);
    
    console.log(`📚 Created library structure at: ${libDir}`);
    console.log(`📝 Focus on documentation and examples instead of unit tests`);
  }

  // Note: UI components will be created through eevee-ds MCP workflow later
  console.log(`🎨 For UI components: Use eevee-ds MCP workflow exclusively`);
  console.log(`📖 Focus on comprehensive documentation and usage examples`);
}

function getCurrentUser(): string {
  try {
    return execSync('git config user.name', { encoding: 'utf8' }).trim();
  } catch {
    return 'Developer';
  }
}

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w)/g, (match) => 
    match.replace('-', '').toUpperCase()
  );
}

// Run the command
const featureName = process.argv[2];
if (featureName) {
  createNewFeature(featureName);
} else {
  console.error('Usage: tsx .sdd/commands/new_feature.ts <feature-name>');
  process.exit(1);
}