# Viem v3 Source

This directory contains the v3 rewrite. The legacy v2 implementation lives in
`src-old` while modules are rewritten into the new structure.

Rewrite order follows the dependency tree from leaves to roots:

1. `utils/` and `core/internal/`
2. `rpc/`
3. `chains/`
4. `core/`
5. `actions/`
6. `tempo/`

Each module should have its reviewed API captured in the v3 plan before its
public entrypoint is switched.
