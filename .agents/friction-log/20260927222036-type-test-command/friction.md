---
title: 'Type-test command discovers no test-d files'
severity: 'minor'
---

### Expected Behavior

pnpm test:typecheck should discover colocated .test-d.ts files.

### Current Behavior

The core project reports No test files found for src/clients/createClientResolver.test-d.ts.

### Possible Solution

Enable typecheck on the core project and configure its include and tsconfig. A temporary targeted configuration successfully discovers the file.

### Minimal Reproducible Example

pnpm test:typecheck --run --project core src/clients/createClientResolver.test-d.ts

### Context

Encountered while checking generic inference for createClientResolver.
