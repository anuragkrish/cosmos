# AI Agents Guide for This Repository

This repository follows **Specification-Driven Development (SDD)** principles. All AI agents must comply with the constitutional articles and established workflows.

## 🏗️ Project Structure

This is a **Next.js 15.5.2** project with:
- **React 19.1.0** 
- **TypeScript 5**
- **Turbopack** for fast development and builds
- **Zustand** for client-side state management with slice-based architecture
- **React Query** for server state management and data fetching
- **ESLint 9** for code quality
- **Specification-Driven Development** methodology

## 📜 Constitutional Requirements

Before any coding work, AI agents MUST follow these constitutional articles:

**CRITICAL**: All UI component work requires eevee-ds MCP. If not available, agents must request installation before proceeding.

### Article I: Library-First Principle
Every feature MUST begin as a standalone library in `src/lib/[feature-name]/`

### Article II: Interface Clarity Mandate  
All features must provide clear, well-defined interfaces:
- Library APIs must be intuitive and well-typed
- Component interfaces should follow React best practices and use eevee-ds MCP
- API endpoints must follow REST conventions
- All interfaces must be thoroughly documented
- UI components must be created through eevee-ds MCP workflow

### Article III: Approval Imperative
No implementation without:
- Obtaining specification approval from designated reviewers
- Obtaining plan approval from designated approvers
- Following approval-driven development workflow

### Article IV: Specification Supremacy
Specifications are the primary artifact. Code is the expression of specifications.

### Article V: Simplicity Doctrine
Choose the simplest solution that satisfies requirements.

### Article VI: Documentation Imperative
Complete documentation is required for every feature.

### Article VII: Reversibility Principle
All changes must be reversible with clear rollback procedures.

### Article VIII: Transparency Rule
All development decisions must be traceable from specification to implementation.

### Article IX: Evolution Covenant
Specifications and implementations evolve together with explicit versioning.

### Article X: Design System Integration Covenant
All UI components must integrate with Headout Design System through eevee-ds MCP:
- Verify eevee-ds MCP availability before component development
- Use eevee-ds MCP component creation workflow exclusively
- Maintain design system consistency and patterns
- Follow eevee-ds MCP guidelines for all UI work

## 🚀 Required Workflow for AI Agents

### 0. eevee-ds MCP Verification (MANDATORY PRE-CHECK)

```bash
# Before any UI component work, verify eevee-ds MCP is available
# If not available, inform user to install eevee-ds MCP first
```

**Installation Warning**: If eevee-ds MCP is not available:
```
⚠️  eevee-ds MCP is required for component creation but not installed.

Please install eevee-ds MCP to ensure proper component creation workflow
and consistency with Headout Design System.
```

### 1. Feature Creation (MANDATORY FIRST STEP)

```bash
# Create new feature specification and scaffold
pnpm sdd:new feature-name
```

This automatically:
- ✅ Creates feature branch `feature/feature-name`
- ✅ Generates specification with frontmatter at `.sdd/specs/feature-name.md`
- ✅ Creates library structure in `src/lib/feature-name/`
- ✅ Sets up approval workflow (Article III)
- ✅ Sets up proper TypeScript interfaces

### 2. Specification Definition (REQUIRED)

Edit `.sdd/specs/feature-name.md` with:
- Clear problem statement
- Functional and non-functional requirements  
- User stories and acceptance criteria
- API specifications in TypeScript
- Test cases and success metrics

### 3. Implementation Plan Generation

```bash
# Generate detailed implementation plan
pnpm sdd:plan feature-name  
```

This creates `.sdd/plans/feature-name-plan.md` with:
- Constitutional compliance validation
- Phase-by-phase implementation steps
- Risk assessment and mitigation
- Dependencies and timeline estimation

### 4. Implementation Following Constitutional Order

**Order is CRITICAL:**

0. **eevee-ds MCP Verification** (Article X - REQUIRED FIRST)
   - Verify eevee-ds MCP availability for any UI component work
   - Stop and request installation if not available
   - Do not proceed with manual component creation

1. **Library Implementation First** (Article I)
   - Implement in `src/lib/feature-name/`
   - Start with types in `types.ts`
   - Implement core logic in `core.ts`
   - Export through `index.ts`
   - No unit tests required - focus on clear interfaces and documentation

2. **Ensure Approvals Obtained** (Article III)
   - Specifications must be approved by reviewers
   - Plans must be approved by approvers
   - Track approval status in frontmatter

3. **Interface Definition** (Article II)
   - Define clear TypeScript interfaces in `types.ts`
   - Follow React best practices for components
   - Use eevee-ds MCP for all component creation
   - Ensure thorough documentation of all APIs

4. **Component Creation through eevee-ds MCP** (Article X)
   - Use eevee-ds MCP workflow exclusively for UI components
   - Maintain design system consistency
   - Follow MCP component creation guidelines

5. **Documentation** (Article VI)
   - Update specifications with implementation notes
   - Document API usage and examples
   - Create user guides if needed

## 🛠️ Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Development | `pnpm dev` | Start Next.js dev server with Turbopack |
| Build | `pnpm build` | Build for production with Turbopack |
| Lint | `pnpm lint` | Run ESLint code quality checks |
| New Feature | `pnpm sdd:new <name>` | Create new feature following SDD |
| Generate Plan | `pnpm sdd:plan <name>` | Generate implementation plan |

## 📁 Directory Structure for AI Agents

```
├── .sdd/                           # Specification-Driven Development
│   ├── constitution.md            # 11 constitutional articles
│   ├── config.json               # SDD configuration
│   ├── templates/                # Specification templates
│   ├── commands/                 # TypeScript SDD commands
│   ├── specs/                    # Feature specifications
│   ├── plans/                    # Implementation plans
│   └── AI_INTEGRATION.md         # Detailed AI integration guide
├── src/
│   ├── lib/                      # Article I: Library-first implementations
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
- ❌ Skip specification creation
- ❌ Implement without approvals
- ❌ Create features without clear interfaces
- ❌ Bypass constitutional articles (especially Article X)
- ❌ Make changes without following SDD workflow

### ALWAYS DO:
- ✅ Verify eevee-ds MCP availability before component work
- ✅ Use eevee-ds MCP component creation workflow exclusively
- ✅ Request MCP installation if not available
- ✅ Start with `pnpm sdd:new <feature-name>`
- ✅ Follow library-first approach
- ✅ Obtain approvals before implementation
- ✅ Define clear interfaces with TypeScript
- ✅ Generate implementation plans
- ✅ Validate constitutional compliance (all 10 articles)
- ✅ Document everything thoroughly

## 🔧 Validation

```bash
# Validate library interfaces (Article II compliance)
npm run type-check

# Run linting (quality assurance)
pnpm lint

# Build verification
pnpm build
```

## 🔄 Development Workflow Summary

0. **eevee-ds MCP Check**: Verify MCP availability for UI work (REQUIRED)
1. **Specification First**: `pnpm sdd:new feature-name`
2. **Define Requirements**: Edit `.sdd/specs/feature-name.md`
3. **Generate Plan**: `pnpm sdd:plan feature-name` 
   - **IMPORTANT**: Update generated plan with relevant context from specification
   - Add specific API details, realistic timelines, and detailed task breakdowns
   - Include architecture diagrams and component descriptions
4. **Get Approvals**: Ensure specs and plans are approved
5. **Implement Library**: Code in `src/lib/feature-name/`
6. **Component Creation**: Use eevee-ds MCP workflow for UI components
7. **Define Interfaces**: Create clear TypeScript interfaces
8. **Validate**: Check interfaces, run lint, build project
9. **Document**: Complete all documentation

## 📖 Additional Resources

- **Constitution**: `.sdd/constitution.md` - Full constitutional articles
- **AI Integration**: `.sdd/AI_INTEGRATION.md` - Comprehensive AI agent guide  
- **Templates**: `.sdd/templates/` - Specification and plan templates
- **Configuration**: `.sdd/config.json` - SDD system configuration

---

**Remember**: 
- Specifications drive code generation, not the other way around
- eevee-ds MCP is REQUIRED for all UI component work - verify availability first
- Always follow the constitutional articles (all 10) to maintain code quality, testability, and maintainability
- Component creation must use eevee-ds MCP workflow exclusively