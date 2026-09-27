---
title: 'Repository type check reports conflicting window.ethereum declarations after declaration build'
severity: 'minor'
---

### Expected Behavior

The repository type check should accept the global provider declaration after building package declarations.

### Current Behavior

After pnpm build:types, NODE_OPTIONS=--max-old-space-size=6144 pnpm check:types reports TS2717 at src/types/window.ts:5 for Window.ethereum. The resolver declaration build and targeted inference checks pass.

### Possible Solution

Investigate projects that load both source and generated package declarations.

### Minimal Reproducible Example

pnpm build:types
NODE_OPTIONS=--max-old-space-size=6144 pnpm check:types

### Context

Observed during createClientResolver verification. The same run also lacked generated contract fixtures, so this was not a clean full-suite environment.
