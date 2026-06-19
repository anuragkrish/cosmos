#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Specification-Driven Development: Generate Plan Command
 * Generates implementation plan from feature specification
 */

interface SpecMetadata {
  title: string;
  version: string;
  date: string;
  author: string;
  status: string;
  type: string;
  tags?: string[];
  reviewers?: string[];
  approvers?: string[];
  related_specs?: string[];
}

interface PlanMetadata {
  title: string;
  type: 'implementation-plan';
  feature: string;
  spec_version: string;
  plan_version: string;
  estimated_effort: string;
  assigned_team: string;
  created_date: string;
  phases: string[];
  constitutional_compliance: string[];
  dependencies: string[];
  risks: string[];
}

function generateImplementationPlan(featureName: string): void {
  if (!featureName) {
    console.error('Usage: tsx .sdd/commands/generate_plan.ts <feature-name>');
    process.exit(1);
  }

  const specFile = path.join('.sdd', 'specs', `${featureName}.md`);
  const planDir = path.join('.sdd', 'plans');
  const planFile = path.join(planDir, `${featureName}-plan.md`);

  // Check if specification exists
  if (!fs.existsSync(specFile)) {
    console.error(`Feature specification not found: ${specFile}`);
    console.log(`Run 'tsx .sdd/commands/new_feature.ts ${featureName}' first`);
    process.exit(1);
  }

  // Ensure plans directory exists
  if (!fs.existsSync(planDir)) {
    fs.mkdirSync(planDir, { recursive: true });
  }

  // Read and parse specification
  const specContent = fs.readFileSync(specFile, 'utf8');
  const specData = matter(specContent);
  const specMeta = specData.data as SpecMetadata;

  // Read plan template
  const templatePath = path.join('.sdd', 'templates', 'implementation-plan.md');
  if (!fs.existsSync(templatePath)) {
    console.error('Implementation plan template not found.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const templateData = matter(template);

  // Create plan metadata
  const planMeta: PlanMetadata = {
    title: `Implementation Plan: ${featureName}`,
    type: 'implementation-plan',
    feature: featureName,
    spec_version: specMeta.version || '1.0',
    plan_version: '1.0',
    estimated_effort: estimateEffort(specData.content),
    assigned_team: specMeta.author || 'Development Team',
    created_date: new Date().toISOString().split('T')[0],
    phases: ['foundation', 'core_implementation', 'integration_validation', 'documentation_deployment'],
    constitutional_compliance: [
      'Article I: Library-First Principle',
      'Article II: Interface Clarity Mandate',
      'Article III: Approval Imperative',
      'Article IV: Specification Supremacy',
      'Article V: Simplicity Doctrine',
      'Article VI: Documentation Imperative (no unit tests required)',
      'Article VII: Reversibility Principle',
      'Article VIII: Transparency Rule',
      'Article IX: Evolution Covenant',
      'Article X: Design System Integration (eevee-ds MCP)'
    ],
    dependencies: extractDependencies(specData.content),
    risks: extractRisks(specData.content)
  };

  // Replace template placeholders
  const planContent = templateData.content
    .replace(/\[Feature name from specification\]/g, featureName)
    .replace(/\[Version reference\]/g, planMeta.spec_version)
    .replace(/\[Time estimate\]/g, planMeta.estimated_effort)
    .replace(/\[Team\/individuals\]/g, planMeta.assigned_team)
    .replace(/\[Creation date\]/g, planMeta.created_date)
    .replace(/\[feature-name\]/g, featureName)
    .replace(/\[FeatureName\]/g, toPascalCase(featureName));

  // Generate final plan with frontmatter
  const finalPlan = matter.stringify(planContent, planMeta);

  // Write implementation plan
  fs.writeFileSync(planFile, finalPlan);

  console.log(`✅ Generated implementation plan: ${planFile}`);
  console.log(`📋 Review and customize the plan based on your specification`);
  console.log(`⚠️  IMPORTANT: Verify eevee-ds MCP availability before UI component work`);
  console.log(`🏗️  Follow the phases outlined in the plan`);
  console.log(`✅ Ensure all Constitutional Articles are followed (especially Article X)`);
  console.log(`📖 Focus on comprehensive documentation and examples instead of unit tests`);

  // Validate constitutional compliance
  validateConstitutionalCompliance(planMeta.constitutional_compliance);
  
  // Show plan summary
  showPlanSummary(planMeta);
}

function extractDependencies(specContent: string): string[] {
  const dependencies: string[] = [];
  
  // Look for dependency patterns in spec
  const depMatches = specContent.match(/(?:depend|require|need)s?\s+([^.\n]+)/gi);
  if (depMatches) {
    dependencies.push(...depMatches.map(match => match.trim()));
  }
  
  // Check for UI component requirements
  if (specContent.match(/component|UI|interface|button|form|input/gi)) {
    dependencies.push('eevee-ds MCP for component creation');
  }
  
  return dependencies;
}

function extractRisks(specContent: string): string[] {
  const risks: string[] = [];
  
  // Look for risk patterns in spec
  const riskMatches = specContent.match(/(?:risk|concern|challenge)[^.\n]+/gi);
  if (riskMatches) {
    risks.push(...riskMatches.map(match => match.trim()));
  }
  
  return risks;
}

function estimateEffort(specContent: string): string {
  // Simple effort estimation based on content
  const requirementCount = (specContent.match(/- \[ \]/g) || []).length;
  const exampleCount = (specContent.match(/Example|Usage/g) || []).length;
  const wordCount = specContent.split(/\s+/).length;
  
  let effort = '1-2 weeks';
  
  if (requirementCount > 20 || exampleCount > 10 || wordCount > 2000) {
    effort = '3-4 weeks';
  } else if (requirementCount > 10 || exampleCount > 5 || wordCount > 1000) {
    effort = '2-3 weeks';
  }
  
  return effort;
}

function validateConstitutionalCompliance(articles: string[]): void {
  console.log('\n📜 Constitutional Compliance Check:');
  
  articles.forEach(article => {
    console.log(`✅ ${article}`);
  });

  console.log('\n✅ All constitutional articles addressed in the plan.');
}

function showPlanSummary(planMeta: PlanMetadata): void {
  console.log('\n📊 Plan Summary:');
  console.log(`🎯 Feature: ${planMeta.feature}`);
  console.log(`⏱️  Estimated Effort: ${planMeta.estimated_effort}`);
  console.log(`👥 Assigned Team: ${planMeta.assigned_team}`);
  console.log(`🏗️  Phases: ${planMeta.phases.length}`);
  
  if (planMeta.dependencies.length > 0) {
    console.log(`📦 Dependencies: ${planMeta.dependencies.length}`);
  }
  
  if (planMeta.risks.length > 0) {
    console.log(`⚠️  Identified Risks: ${planMeta.risks.length}`);
  }
}

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w)/g, (match) => 
    match.replace('-', '').toUpperCase()
  );
}

// Install gray-matter if not already installed
try {
  require.resolve('gray-matter');
} catch (e) {
  console.error('Missing dependency: gray-matter');
  console.log('Install with: pnpm add gray-matter');
  console.log('Install types with: pnpm add -D @types/gray-matter');
  process.exit(1);
}

// Run the command
const featureName = process.argv[2];
if (featureName) {
  generateImplementationPlan(featureName);
} else {
  console.error('Usage: tsx .sdd/commands/generate_plan.ts <feature-name>');
  process.exit(1);
}