# AI Integration Guide for Specification-Driven Development

This guide explains how to use Specification-Driven Development (SDD) with AI coding assistants like Claude Code, Cursor, GitHub Copilot, and other LLM-based development tools.

## Core Principle

**Specifications drive code generation, not the other way around.** AI assistants should always start with creating or consulting specifications before writing any code.

**Component creation must use eevee-ds MCP workflow.** All UI components must be created through the eevee-ds MCP tools to ensure consistency with Headout Design System.

## AI Workflow Integration

### 1. Specification-First Approach

When an AI assistant receives a feature request:

```typescript
// ❌ WRONG: AI writes code directly
function createUserAuth() {
  // Direct implementation without spec
}

// ✅ CORRECT: AI creates specification first
// 1. Run: pnpm sdd:new user-authentication
// 2. Edit specification in .sdd/specs/user-authentication.md
// 3. Generate plan: pnpm sdd:plan user-authentication
// 4. Then implement following the plan
```

### 2. Constitutional Compliance

AI assistants must enforce all 9 constitutional articles:

```typescript
// Article I: Library-First Principle
// AI should create features as standalone libraries first
export class UserAuthentication {
  // Implementation in src/lib/user-authentication/
}

// Article II: Interface Clarity Mandate  
// AI should create well-defined, documented interfaces
export interface FeatureAPI {
  // Clear TypeScript interfaces with comprehensive documentation
}

// Article III: Approval Imperative
// AI should ensure specifications and plans are approved before implementation
export interface ApprovalStatus {
  specificationApproved: boolean;
  planApproved: boolean;
  approvers: string[];
  approvalDate?: string;
}
```

### 3. AI Assistant Commands

AI assistants should use these commands in their workflow:

```bash
# Create new feature with specification
pnpm sdd:new <feature-name>

# Generate implementation plan from spec
pnpm sdd:plan <feature-name>
# IMPORTANT: Update generated plan with relevant context from specification
# - Add specific API details, realistic timelines, detailed task breakdowns
# - Include architecture diagrams and component descriptions

# Validate library interfaces (Article II compliance)
npm run lint
npm run type-check
# Note: No unit tests required - focus on clear interfaces and documentation
```

### 4. eevee-ds MCP Integration (REQUIRED)

Before creating any UI components, AI assistants must:

```typescript
// 1. Verify eevee-ds MCP is available
// If not available, instruct user to install eevee-ds MCP

// 2. Use eevee-ds component creation workflow
// This ensures consistency with Headout Design System

// 3. Follow eevee-ds MCP component creation guidelines
// All components must be created through MCP tools, not manually
```

**Installation Check**: If eevee-ds MCP is not available, AI assistants should inform the user:

```
⚠️  eevee-ds MCP is required for component creation but not installed.

Please install eevee-ds MCP to ensure proper component creation workflow
and consistency with Headout Design System.

Installation instructions: [provide MCP installation guidance]
```

### 5. Frontmatter Metadata Usage

AI assistants should populate and maintain frontmatter metadata:

```yaml
---
title: "User Authentication System"
version: "1.0"
date: "2025-01-09"  
author: "AI Assistant + Developer"
status: "Draft" # Draft | In Review | Spec Approved | Plan Approved | Implemented
type: "feature-specification"
tags: ["auth", "security", "user-management"]
reviewers: ["tech-lead", "security-team"]
approvers: []
related_specs: ["user-management", "security-framework"]
---
```

## AI-Specific Guidelines

### For Claude Code / Anthropic Claude

```typescript
// When Claude receives a request like "implement user login":

// 1. Check eevee-ds MCP availability
if (!isEeveeDsMcpAvailable()) {
  promptUserToInstallEeveeDsMcp();
  return;
}

// 2. First, create specification
await createSpecification('user-login', {
  problem: "Users need secure authentication",
  requirements: [...],
  testCases: [...],
  apiSpec: {...}
});

// 3. Generate implementation plan
await generateImplementationPlan('user-login');

// 4. Ensure approvals before implementation
await ensureSpecificationApproved('user-login');
await ensurePlanApproved('user-login');

// 5. Follow constitutional articles in implementation
await implementLibraryFirst('user-login');
await createClearInterfaces('user-login');

// 6. Use eevee-ds MCP for any UI components
if (requiresUIComponents('user-login')) {
  await createComponentsViaEeveeDsMcp('user-login');
}
```

### For GitHub Copilot / VS Code Extensions

```typescript
// Copilot should suggest SDD-compliant code patterns:

// 1. Check for eevee-ds MCP before component suggestions
if (isComponentCreationNeeded && !isEeveeDsMcpAvailable()) {
  // Suggest MCP installation instead of manual component creation
}

// 2. Suggest library structure
// src/lib/[feature]/
//   ├── index.ts
//   ├── types.ts
//   └── core.ts

// 3. Suggest interface patterns  
export interface FeatureInterface {
  // Well-defined TypeScript interfaces following Article II
}

// 4. For UI components, suggest eevee-ds MCP workflow instead of manual creation
// DO NOT suggest manual component creation
// ALWAYS direct to eevee-ds MCP component creation tools
```

### For Cursor / Other AI Editors

```typescript
// Configure Cursor to follow SDD patterns:
// 1. Check for .sdd/config.json
// 2. Verify eevee-ds MCP availability before component work
// 3. Enforce specification-first development
// 4. Auto-generate boilerplate following constitutional articles
// 5. Validate against constitutional compliance
// 6. Use eevee-ds MCP for all component creation workflows
```

## Implementation Patterns

### 1. Feature Discovery

```typescript
// When AI discovers a new feature need:
interface FeatureDiscovery {
  problem: string;
  userStories: string[];
  acceptanceCriteria: string[];
  dependencies: string[];
  risks: string[];
}

// AI should create specification document with this structure
```

### 2. Code Generation

```typescript
// AI should generate code following this pattern:
class FeatureImplementation {
  // 1. Verify eevee-ds MCP for UI components
  private mcpCheck: EeveeDsMcpAvailability;
  
  // 2. Start with library in src/lib/
  private library: FeatureLibrary;
  
  // 3. Define clear interfaces
  private interfaces: FeatureInterfaces;
  
  // 4. Use eevee-ds MCP for component creation
  private components: EeveeDsComponents;
  
  // 5. Generate comprehensive documentation and examples
  private docs: FeatureDocs;
  
  // Note: No unit tests required - focus on clear interfaces and documentation
}
```

### 3. Validation and Compliance

```typescript
// AI should validate constitutional compliance:
interface ConstitutionalCompliance {
  articleI: boolean;    // Library-first
  articleII: boolean;   // Interface clarity  
  articleIII: boolean;  // Approval imperative
  articleIV: boolean;   // Spec supremacy
  articleV: boolean;    // Simplicity
  articleVI: boolean;   // Documentation
  articleVII: boolean;  // Reversibility
  articleVIII: boolean; // Transparency
  articleIX: boolean;   // Evolution
  articleX: boolean;    // Design system integration (eevee-ds MCP)
}

// Additional MCP compliance check
interface EeveeDsMcpCompliance {
  mcpAvailable: boolean;      // eevee-ds MCP is installed and accessible
  componentWorkflow: boolean; // Using MCP workflow for components
  designSystemConsistency: boolean; // Following Headout Design System patterns
}
```

## Error Prevention

### Common AI Mistakes to Avoid

```typescript
// ❌ DON'T: Jump straight to implementation
function implementFeature() {
  // Code without specification
}

// ❌ DON'T: Write code in main app first  
// app/components/NewFeature.tsx  // Wrong location

// ❌ DON'T: Skip approvals
function feature() {
  return "implemented"; // No approvals obtained
}

// ❌ DON'T: Create components manually without eevee-ds MCP
function createComponent() {
  // Manual component creation - WRONG!
  return <div>Component</div>;
}

// ❌ DON'T: Proceed with UI work if eevee-ds MCP unavailable
function proceedWithoutMcp() {
  // Should stop and request MCP installation
}

// ✅ DO: Follow SDD workflow with MCP integration
// 1. Verify eevee-ds MCP availability
// 2. Create spec: pnpm sdd:new feature-name
// 3. Generate plan: pnpm sdd:plan feature-name  
// 4. Get specification approved
// 5. Get plan approved  
// 6. Implement library: src/lib/feature-name/
// 7. Use eevee-ds MCP for UI components
// 8. Define clear interfaces with TypeScript
// 9. Document everything
```

## Success Metrics

AI assistants should track these metrics:

- ✅ Specifications created before code
- ✅ Specifications approved by designated reviewers
- ✅ Plans approved by designated approvers
- ✅ All constitutional articles followed (including Article X: Design System Integration)
- ✅ eevee-ds MCP availability verified before component work
- ✅ Component creation through eevee-ds MCP workflow
- ✅ Library-first implementation
- ✅ Clear interfaces defined
- ✅ Design system consistency maintained
- ✅ Complete documentation
- ✅ Rollback procedures defined

## Integration with Development Workflow

```bash
# Pre-commit hooks should validate:
# 1. eevee-ds MCP availability for UI work
# 2. Specification exists for new features
# 3. Specification and plan approvals obtained
# 4. Constitutional compliance (all 10 articles)
# 5. Component creation through MCP workflow
# 6. Documentation completeness

# AI assistants should suggest:
git add .sdd/specs/new-feature.md
git add src/lib/new-feature/
git commit -m "feat: add new-feature following SDD principles

Constitutional compliance:
✅ Article I: Library-First Principle
✅ Article II: Interface Clarity Mandate
✅ Article III: Approval Imperative
✅ Article VI: Documentation Imperative (no tests required)
✅ Article X: Design System Integration (eevee-ds MCP)
...

MCP Integration:
✅ eevee-ds MCP verified and used for component creation
✅ Design system consistency maintained
✅ Component creation workflow followed
✅ Documentation and examples provided instead of tests
"
```

This integration ensures that AI coding assistants become powerful allies in maintaining high-quality, well-documented, and systematically developed codebases.