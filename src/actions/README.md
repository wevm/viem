# Actions

Owns the rewritten action implementations after their lower-level dependencies
are rewritten. Actions should depend on v3 domain objects, chains, accounts,
transports, and clients instead of legacy v2 modules.

Do not start action rewrites until the action API is recorded in the v3 plan.
