# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 15.5.2** project with TypeScript that follows **Specification-Driven Development (SDD)** methodology. The project uses:

**⚠️ CRITICAL**: This project requires **eevee-ds MCP** for component creation. Verify MCP availability before any UI work.

- **React 19.1.0** for UI components
- **Turbopack** for fast development and builds
- **Zustand** for client-side state management with slice-based architecture
- **React Query** for server state management and data fetching
- **Headout Design System**: @headout/eevee, @headout/onix, @headout/pixie
- **Panda CSS** for styling with design tokens
- **ESLint 9** for code quality
- **pnpm** as package manager

## Development Commands

```bash
# Development server with Turbopack
pnpm dev

# Build for production with Turbopack
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint

# SDD Feature Creation (REQUIRED for all new features)
pnpm sdd:new <feature-name>

# Generate Implementation Plan
pnpm sdd:plan <feature-name>
```

## eevee-ds MCP Requirements

**MANDATORY**: Before any UI component work, verify eevee-ds MCP is installed and available.

### MCP Installation Check

If eevee-ds MCP is not available, Claude Code will display:

```
⚠️  eevee-ds MCP is required for component creation but not installed.

Please install eevee-ds MCP to ensure proper component creation workflow
and consistency with Headout Design System.

Installation instructions:
1. Install eevee-ds MCP according to your MCP client documentation
2. Restart Claude Code to recognize the new MCP
3. Verify MCP tools are available before proceeding
```

### Component Creation Workflow

All UI components MUST be created through eevee-ds MCP:
- Use MCP component creation tools exclusively
- Follow Headout Design System patterns
- Maintain consistency with existing components
- Never create components manually

## Architecture & SDD Constitutional Requirements

This project follows **11 Constitutional Articles** that MUST be followed for all development.

**📜 See complete constitutional requirements**: `.sdd/constitution.md`

**🤖 For AI integration guidelines**: `.sdd/AI_INTEGRATION.md`

### Key Constitutional Principles:
- **Article I**: Library-First Principle - Every feature starts as a standalone library in `src/lib/[feature-name]/`
- **Article II**: Interface Clarity Mandate - All features must have well-defined, documented interfaces and use eevee-ds MCP
- **Article III**: Approval Imperative - Obtain approvals before implementation
- **Article X**: Design System Integration Covenant - All UI components must use eevee-ds MCP workflow
- **Article XI**: State Management Covenant - Use Zustand for client state, React Query for server state
- **Articles IV-IX**: Specification supremacy, simplicity, documentation, reversibility, transparency, evolution

## Required Development Workflow

**NEVER skip this workflow:**

0. **eevee-ds MCP Verification**: Verify MCP availability for UI components (REQUIRED FIRST STEP)
   - Stop and request installation if not available
   - Do not proceed with manual component creation

1. **Create Feature Specification**: `pnpm sdd:new <feature-name>`
   - Creates feature branch `feature/<feature-name>`
   - Generates spec in `.sdd/specs/<feature-name>.md`
   - Scaffolds library structure in `src/lib/<feature-name>/`
   - Sets up approval workflow
   - Sets up library structure

2. **Edit Specification**: Define requirements in `.sdd/specs/<feature-name>.md`

3. **Generate Plan**: `pnpm sdd:plan <feature-name>`
   - Creates implementation plan in `.sdd/plans/<feature-name>-plan.md`
   - **IMPORTANT**: Update generated plan with relevant context from specification
   - Add specific API details, realistic timelines, and detailed task breakdowns
   - Include architecture diagrams and component descriptions

4. **Implementation Order**:
   - Get specification approved
   - Get plan approved
   - Library implementation in `src/lib/<feature-name>/`
   - Use eevee-ds MCP for UI components
   - Integration with web application
   - Documentation

## Design System Integration

Uses **Headout's Eevee Design System** through **eevee-ds MCP**:

```tsx
// Components must be created through eevee-ds MCP, not manually
// MCP handles proper integration with design system

import { Box, Text } from '@headout/eevee';

// Use textStyle from design tokens (MCP ensures proper usage)
<Text textStyle={'display.extraLarge'}>Title</Text>
```

**eevee-ds MCP Integration**:
- All components created through MCP workflow
- Ensures proper design system consistency
- Handles proper imports and usage patterns
- Maintains Headout Design System standards

**Panda CSS Configuration**:
- Config: `panda.config.ts`
- Output: `styled-system/`
- Includes Headout design tokens and animations

## State Management Architecture

This project uses a **dual-state approach**:

### Client State (Zustand)
- **Slice-based architecture** in `src/stores/slices/`
- **Combined store** in `src/stores/store.ts`
- **Hook-based usage** with `useBoundStore`

```tsx
// Usage example
import { useBoundStore } from '@/stores/store'

const count = useBoundStore(state => state.count)
const increment = useBoundStore(state => state.incrementCount)
```

### Server State (React Query)
- **Data fetching** and **caching**
- **Background updates** and **synchronization**
- **Error and loading states**

## Project Structure

```
├── .sdd/                          # Specification-Driven Development
│   ├── constitution.md           # 11 constitutional articles
│   ├── config.json              # SDD configuration
│   ├── templates/               # Spec and plan templates
│   ├── commands/                # TypeScript SDD commands
│   ├── specs/                   # Feature specifications
│   └── plans/                   # Implementation plans
├── src/
│   ├── lib/                     # Library-first implementations (no tests required)
│   ├── stores/                  # State management
│   │   ├── slices/              # Zustand slices for different domains
│   │   │   └── counter.ts       # Counter slice example
│   │   └── store.ts             # Combined Zustand store
│   ├── pages/                   # Next.js pages
│   │   ├── api/                # API routes
│   │   ├── _app.tsx            # App configuration
│   │   ├── _document.tsx       # Document configuration
│   │   └── index.tsx           # Home page
│   └── styles/                 # CSS styles
├── styled-system/              # Generated Panda CSS
├── panda.config.ts            # Panda CSS configuration
└── package.json               # Dependencies and scripts
```

## Key Configuration Files

- **TypeScript**: `tsconfig.json`, `next-env.d.ts`
- **ESLint**: `eslint.config.mjs`
- **Prettier**: `.prettierrc`
- **Panda CSS**: `panda.config.ts`
- **PostCSS**: `postcss.config.cjs`
- **SDD Config**: `.sdd/config.json`

## Approval Strategy

- Specifications must be approved before implementation
- Plans must be approved before coding begins
- Track approval status in frontmatter metadata

## Dependencies

**Core Framework**:
- Next.js with App Router and Turbopack
- React 19.1.0 with TypeScript 5

**Headout Design System**:
- @headout/eevee (components)
- @headout/onix (utilities) 
- @headout/pixie (additional components)

**State Management**:
- Zustand for client state with slice-based architecture
- React Query for server state and data fetching

**Development Tools**:
- ESLint 9 for code quality
- Prettier for formatting
- TSX for running TypeScript files
- Gray-matter for markdown processing

## Important Notes

- **eevee-ds MCP is REQUIRED** - verify availability before any UI component work
- **Component creation through MCP only** - never create components manually
- **Request MCP installation** - stop work and ask user to install if not available
- **Never bypass SDD workflow** - always use `pnpm sdd:new` first
- **Constitutional compliance is mandatory** - all 10 articles must be followed
- **Library-first principle** - implement in `src/lib/` before using in pages
- **Well-defined interfaces required** - every feature needs clear, documented APIs
- **Approval-driven development** - get approvals before implementation
- **Specification-first** - specs drive implementation, not vice versa
- **No unit tests required** - focus on clear documentation and examples