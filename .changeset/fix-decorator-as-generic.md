---
'viem': patch
---

Fixed the `publicActions` decorator and `Contract.from` methods dropping the `as` type parameter on `contract.read` and `contract.simulate`, mistyping `as: 'Array'` results.
