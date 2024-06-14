---
"viem": minor
---

Added `factory` & `factoryData` parameters to `call` & `readContract` to enable [Deployless Calls](https://viem.sh/docs/actions/public/call#deployless-calls) (calling a function on a contract which has not been deployed) via a [Factory Contract](https://docs.alchemy.com/docs/create2-an-alternative-to-deriving-contract-addresses). 

This is particularly useful for the use case of calling functions on [ERC-4337 Smart Accounts](https://eips.ethereum.org/EIPS/eip-4337) that have not been deployed yet.
