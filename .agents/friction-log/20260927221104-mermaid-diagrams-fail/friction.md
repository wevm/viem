---
title: 'Mermaid diagrams fail in the docs dev server without dependency prebundling'
severity: 'minor'
---

### Expected Behavior
Mermaid fences render diagrams in the docs preview.

### Current Behavior
With Vocs 2.8.1 and mermaid installed, the browser reports that dayjs does not provide a default export.

### Possible Solution
Use vite dev with the Vocs and React plugins and optimizeDeps.include for mermaid. The vocs dev CLI disables custom Vite config loading.

### Minimal Reproducible Example
Add mermaid to the site dependencies, write a mermaid fence, and run pnpm docs:dev.

### Context
Discovered while previewing the Tempo Relay overview diagram.
