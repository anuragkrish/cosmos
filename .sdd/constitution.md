# Development Constitution

## Article I: The Library-First Principle
Every feature MUST begin its existence as a standalone library. No code shall be written directly within the main application until it has first proven itself as an independent and reusable component.

## Article II: The Interface Clarity Mandate
All features must provide clear, well-defined interfaces:
- Library APIs must be intuitive and well-typed
- Component interfaces should follow React best practices and use eevee-ds MCP component creation workflow
- API endpoints must follow REST conventions
- All interfaces must be thoroughly documented
- Components must be created using the eevee-ds MCP tools for consistency with Headout Design System
- State management interfaces must follow Zustand slice patterns with clear TypeScript definitions

## Article III: The Approval Imperative
No implementation shall commence without:
- Obtaining approval for specifications from designated reviewers
- Obtaining approval for implementation plans from designated approvers
- Validating user acceptance criteria
- Establishing clear success metrics

## Article IV: The Specification Supremacy
Specifications are the primary artifact. Code is merely the expression of the specification. When conflicts arise between specification and implementation, the specification takes precedence.

## Article V: The Simplicity Doctrine
Choose the simplest solution that satisfies all requirements. Complexity must be justified by demonstrable benefit to the end user.

## Article VI: The Documentation Imperative
Every feature must include:
- Clear specification documentation
- Usage examples
- API documentation
- Implementation notes
- No unit tests are required - documentation and examples serve as validation
- **Plan Enhancement Requirement**: Generated implementation plans must be updated with relevant context from specifications, including specific API details, architecture diagrams, realistic timelines, and detailed task breakdowns

## Article VII: The Reversibility Principle
All changes must be reversible. Maintain rollback capabilities and version compatibility.

## Article VIII: The Transparency Rule
Development decisions must be traceable from specification to implementation. No "magic" code without clear documentation.

## Article IX: The Evolution Covenant
Specifications and implementations must evolve together. Neither shall be allowed to drift from the other without explicit versioning and migration paths.

## Article X: The Design System Integration Covenant
All UI components and design patterns must integrate with the Headout Design System through eevee-ds MCP:
- Use eevee-ds MCP component creation workflow for all new components
- Ensure consistency with existing design tokens and patterns
- Verify eevee-ds MCP is installed and available before component development
- Follow the component creation guidelines provided by eevee-ds MCP tools

## Article XI: The State Management Covenant
All state management must follow established patterns for maintainability and consistency:
- Use Zustand for client-side state management with slice-based architecture
- Use React Query for server state management and data fetching
- Each feature should have its own slice in `src/stores/slices/[feature].ts`
- State slices must export clear TypeScript interfaces for State, Actions, and Store types
- Global state should be combined in `src/stores/store.ts` using the `useBoundStore` pattern
- Server state should be managed through React Query with proper caching and error handling