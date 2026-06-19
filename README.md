# Headout Application Template

A comprehensive Next.js 15.5.2 template with TypeScript that follows **Specification-Driven Development (SDD)** methodology, integrated with modern state management and Headout's Design System.

## 🚀 Quick Start

### Automated Setup

**⚠️ Important**: This template repository cannot be cloned directly. You must create a new repository first.

#### Create New Repository from Template
1. **Click "Use this template"** → **"Create a new repository"** on GitHub
2. **Choose repository name** and configure settings (public/private, description, etc.)
3. **Clone your new repository**:
   ```bash
   git clone <your-new-repository-url>
   cd <your-repository-name>

   # Run the interactive initialization script
   ./init.sh
   ```

The `init.sh` script will:
- ✅ Install Node.js 22+ and PNPM 9+ automatically via NVM
- ✅ Configure your application name throughout the codebase
- ✅ Set up Headout deployment pipeline or standalone configuration
- ✅ Install all dependencies
- ✅ Create backups and clean setup

### Manual Setup
```bash
# Install dependencies
pnpm install

# Start development server with Turbopack
pnpm dev

# Open http://localhost:3000
```

## 📋 Prerequisites

**⚠️ CRITICAL**: This project requires **oak MCP** for component creation.

**Before any UI work, verify MCP availability:**
- oak MCP must be installed and configured
- Used exclusively for all component creation
- Ensures consistency with Headout Design System

## 🛠 Technology Stack

### Core Framework
- **Next.js 15.5.2** with TypeScript and Turbopack
- **React 19.1.0** for UI components
- **Node.js 22+** runtime environment
- **PNPM 9+** as package manager

### State Management
- **Zustand** for client-side state with slice-based architecture
- **React Query** for server state management and data fetching
- **Immer** for immutable state updates

### Design System & Styling
- **Headout Design System**: @headout/eevee, @headout/onix, @headout/pixie
- **Panda CSS** for styling with design tokens
- **eevee-ds MCP** for component creation workflow

### Development Tools
- **ESLint 9** for code quality
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Specification-Driven Development** methodology

## 🏗 Architecture

### Specification-Driven Development (SDD)

This project follows **11 Constitutional Articles** for consistent development:

**📜 Complete requirements**: `.sdd/constitution.md`
**🤖 AI integration guidelines**: `.sdd/AI_INTEGRATION.md`

#### Key Principles:
- **Article I**: Library-First Principle - Features start as standalone libraries in `src/lib/[feature-name]/`
- **Article II**: Interface Clarity Mandate - Well-defined, documented interfaces required
- **Article III**: Approval Imperative - Get approvals before implementation
- **Article X**: Design System Integration Covenant - All UI through eevee-ds MCP workflow
- **Article XI**: State Management Covenant - Use Zustand for client state, React Query for server state

### State Management Architecture

#### Dual-State Approach
- **Client State (Zustand)**: UI state, user preferences, temporary data
- **Server State (React Query)**: API data, caching, synchronization

#### Zustand Slice-Based Architecture
```tsx
// Example: Counter slice
export const createCounterSlice: StateCreator<CounterStore> = (set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
});

// Usage in components
import { useBoundStore } from '@/stores/store';

const count = useBoundStore((state) => state.count);
const increment = useBoundStore((state) => state.increment);
```

#### React Query for Server State
```tsx
// API data fetching with React Query
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

## 🔄 Development Workflow

**NEVER skip this workflow:**

### 1. eevee-ds MCP Verification (REQUIRED FIRST)
```bash
# Verify MCP is available before UI work
# If not available, request installation
```

### 2. Create Feature Specification
```bash
pnpm sdd:new <feature-name>
```
- Creates feature branch `feature/<feature-name>`
- Generates spec in `.sdd/specs/<feature-name>.md`
- Scaffolds library in `src/lib/<feature-name>/`

### 3. Edit Specification
Define requirements in `.sdd/specs/<feature-name>.md`

### 4. Generate Implementation Plan
```bash
pnpm sdd:plan <feature-name>
```
- Creates plan in `.sdd/plans/<feature-name>-plan.md`
- Update with specific context and details

### 5. Implementation Order
1. Get specification approved
2. Get plan approved
3. Library implementation in `src/lib/<feature-name>/`
4. Use eevee-ds MCP for UI components
5. Integration with web application
6. Documentation

## 📁 Project Structure

```
├── .sdd/                          # Specification-Driven Development
│   ├── constitution.md           # 10 constitutional articles
│   ├── config.json              # SDD configuration
│   ├── templates/               # Spec and plan templates
│   ├── commands/                # TypeScript SDD commands
│   ├── specs/                   # Feature specifications
│   └── plans/                   # Implementation plans
├── src/
│   ├── lib/                     # Library-first implementations
│   ├── stores/                  # State management
│   │   ├── slices/              # Zustand slices for different domains
│   │   │   └── counter.ts       # Example counter slice
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

## 🎨 Design System Integration

### eevee-ds MCP Workflow
- **All components created through MCP** - never manually
- Ensures proper design system consistency
- Handles imports and usage patterns automatically
- Maintains Headout Design System standards

### Usage Example
```tsx
import { Box, Text } from '@headout/eevee';

// Use textStyle from design tokens (MCP ensures proper usage)
<Text textStyle={'display.extraLarge'}>Title</Text>
```

## ⚙️ Available Commands

### Development
```bash
pnpm dev                    # Development server with Turbopack
pnpm build                  # Production build with Turbopack
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
```

### Specification-Driven Development
```bash
pnpm sdd:new <feature-name>  # Create new feature specification
pnpm sdd:plan <feature-name> # Generate implementation plan
```

### Initialization
```bash
./init.sh                   # Interactive setup script
```

## 🔧 Interactive Setup Script (`init.sh`)

The `init.sh` script provides a comprehensive, interactive setup experience:

### Features
- **🛠 Environment Setup**: Automatically installs Node.js 22+ and PNPM 9+ via NVM
- **📝 Application Configuration**: Replaces `<APPLICATION_NAME>` placeholders throughout codebase
- **🏢 Repository Scope Detection**: Configures for Headout deployment pipeline or standalone setup
- **📦 Dependency Installation**: Automatically runs `pnpm install` after configuration
- **🔒 Backup Management**: Creates timestamped backups with optional cleanup
- **✅ Validation**: Ensures all requirements are met before proceeding

### Usage Flow
```bash
$ ./init.sh

🚀 Headout Application Template Initializer

[INFO] Setting up Node.js and PNPM environment...
[SUCCESS] Environment setup completed successfully

Versions installed:
  • Node.js: v22.0.0 (required: >=22)
  • PNPM: 9.12.1 (required: >=9)

Enter your application name (e.g., my-awesome-app): payment-service

Is this a Headout-scoped repository? (y/N): y
[INFO] Repository will be configured for Headout deployment pipeline

Preview of changes:
📄 package.json: "name": "payment-service"
📄 .github-temp/workflows/build.yml: headout-payment-service
📁 .github-temp/ folder will be renamed to .github/

Proceed with these changes? (y/N): y

[SUCCESS] 🎉 Application successfully initialized as 'payment-service'
[INFO] Installing dependencies...

Next steps:
  1. Run 'pnpm dev' to start development server
  2. Update README.md with your application details
  3. Start building your application!

Would you like to delete the backup folder? (y/N): y
[SUCCESS] Backup folder deleted
```

### Configuration Options
- **Headout-scoped**: Activates GitHub workflows for Headout deployment pipeline
- **Standalone**: Removes Headout-specific configurations for external use
- **Backup Management**: Optional cleanup of backup files after successful setup

## 📝 Key Configuration Files

- **TypeScript**: `tsconfig.json`, `next-env.d.ts`
- **ESLint**: `eslint.config.mjs`
- **Prettier**: `.prettierrc`
- **Panda CSS**: `panda.config.ts`
- **PostCSS**: `postcss.config.cjs`
- **SDD Config**: `.sdd/config.json`
- **State Management**: `src/stores/store.ts`
- **PNPM Workspace**: `pnpm-workspace.yaml`

## 🚨 Important Notes

### Setup Requirements
- **Use `./init.sh` for setup** - automated environment configuration recommended
- **Node.js 22+** and **PNPM 9+** required (automatically installed by init script)
- **eevee-ds MCP is REQUIRED** - verify before any UI work

### Development Guidelines
- **Component creation through MCP only** - never create components manually
- **Never bypass SDD workflow** - always use `pnpm sdd:new` first
- **Constitutional compliance mandatory** - follow all 11 articles
- **Library-first principle** - implement in `src/lib/` before pages
- **State management patterns** - use Zustand for client state, React Query for server state
- **Approval-driven development** - get approvals before implementation
- **No unit tests required** - focus on clear documentation and examples

### Repository Configuration
- **Headout-scoped**: Includes deployment pipeline and containerization
- **Standalone**: Clean setup without Headout-specific configurations
- **GitHub workflows**: Automatically configured based on repository scope

## 🔗 Resources

### Framework & Tools
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Panda CSS Documentation](https://panda-css.com/)

### Development
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PNPM Documentation](https://pnpm.io/)
- [ESLint Configuration](https://eslint.org/docs/latest/use/configure/)

## 📄 License

This template is proprietary to Headout. See internal documentation for usage guidelines.
