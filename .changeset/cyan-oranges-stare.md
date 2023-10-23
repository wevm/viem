---
"viem": minor
---

Added ability for Actions (i.e. `readContract`) to infer their internal/dependant Actions (i.e. `call`) from the optionally extended Client.

For instance, if an extended Client has overridden the `call` Action, then the `readContract` Action will use that instead of Viem's internal `call` Action.
