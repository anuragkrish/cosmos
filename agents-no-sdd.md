# AI Agents Guide for This Repository

This guide provides essential information for AI agents working with this codebase.

## 🏗️ Project Structure

This is a **Next.js 15.5.2** project with:
- **React 19.1.0**
- **TypeScript 5**
- **Turbopack** for fast development and builds
- **Zustand** for client-side state management with slice-based architecture
- **React Query** for server state management and data fetching
- **ESLint 9** for code quality

## 🎨 Design System Requirements

**CRITICAL**: All UI component work requires eevee-ds MCP. If not available, agents must request installation before proceeding.

### eevee-ds MCP Integration

All UI components must integrate with Headout Design System through eevee-ds MCP:
- Verify eevee-ds MCP availability before component development
- Use eevee-ds MCP component creation workflow exclusively
- Maintain design system consistency and patterns
- Follow eevee-ds MCP guidelines for all UI work

**Installation Warning**: If eevee-ds MCP is not available:
```
⚠️  eevee-ds MCP is required for component creation but not installed.

Please install eevee-ds MCP to ensure proper component creation workflow
and consistency with Headout Design System.
```

## 🚀 Development Workflow

### 0. eevee-ds MCP Verification (MANDATORY PRE-CHECK)

```bash
# Before any UI component work, verify eevee-ds MCP is available
# If not available, inform user to install eevee-ds MCP first
```

### 1. Library-First Implementation

Implement features as standalone libraries in `src/lib/[feature-name]/`:
- Start with types in `types.ts`
- Implement core logic in `core.ts`
- Export through `index.ts`
- No unit tests required - focus on clear interfaces and documentation

### 2. Interface Definition

- Define clear TypeScript interfaces in `types.ts`
- Follow React best practices for components
- Use eevee-ds MCP for all component creation
- Ensure thorough documentation of all APIs

### 3. Component Creation through eevee-ds MCP

- Use eevee-ds MCP workflow exclusively for UI components
- Maintain design system consistency
- Follow MCP component creation guidelines

### 4. Documentation

- Document API usage and examples
- Create user guides if needed
- Maintain clear inline documentation

## 🛠️ Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Development | `pnpm dev` | Start Next.js dev server with Turbopack |
| Build | `pnpm build` | Build for production with Turbopack |
| Lint | `pnpm lint` | Run ESLint code quality checks |

## 📁 Directory Structure for AI Agents

```
├── src/
│   ├── lib/                      # Library-first implementations
│   │   └── [feature]/
│   │       ├── index.ts          # Public API exports
│   │       ├── types.ts          # TypeScript interfaces
│   │       └── core.ts           # Core implementation
│   ├── stores/                   # State management
│   │   ├── slices/               # Zustand slices for different domains
│   │   │   └── [feature].ts      # Feature-specific state slice
│   │   └── store.ts              # Combined Zustand store
│   ├── pages/                    # Next.js pages
│   └── styles/                   # CSS styles
└── package.json                  # Project dependencies and scripts
```

## 🚫 AI Agent Restrictions

### NEVER DO:
- ❌ Proceed with UI work without verifying eevee-ds MCP availability
- ❌ Create components manually without eevee-ds MCP
- ❌ Write code directly in `src/pages/` or `src/components/` first
- ❌ Create features without clear interfaces

### ALWAYS DO:
- ✅ Verify eevee-ds MCP availability before component work
- ✅ Use eevee-ds MCP component creation workflow exclusively
- ✅ Request MCP installation if not available
- ✅ Follow library-first approach
- ✅ Define clear interfaces with TypeScript
- ✅ Document everything thoroughly

## 🔧 Validation

```bash
# Validate library interfaces
npm run type-check

# Run linting (quality assurance)
pnpm lint

# Build verification
pnpm build
```

## 🔄 Development Workflow Summary

1. **eevee-ds MCP Check**: Verify MCP availability for UI work (REQUIRED)
2. **Implement Library**: Code in `src/lib/feature-name/`
3. **Component Creation**: Use eevee-ds MCP workflow for UI components
4. **Define Interfaces**: Create clear TypeScript interfaces
5. **Validate**: Check interfaces, run lint, build project
6. **Document**: Complete all documentation

---

**Remember**:
- eevee-ds MCP is REQUIRED for all UI component work - verify availability first
- Always follow the library-first approach to maintain code quality, testability, and maintainability
- Component creation must use eevee-ds MCP workflow exclusively
