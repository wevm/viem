---
"viem": patch
---

Fixed `viem`, `viem/actions`, and `viem/chains` throwing `TypeError: Cannot assign to read only property 'call'` when imported in SES-hardened realms (e.g. LavaMoat, MetaMask Snaps, Ambire). The `call` property of token and tempo actions is now pre-defined as a writable own property, so the namespace assignment emitted by TypeScript no longer hits the read-only `Function.prototype.call` in a hardened realm.
