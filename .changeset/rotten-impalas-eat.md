---
"viem": minor
---

Added support for [Fault Proofs on OP Stack](https://docs.optimism.io/stack/protocol/fault-proofs/overview), and new actions:

- [`getGame`](https://viem.sh/op-stack/actions/getGame) (supersedes `getL2Output`)
- `getGames`
- [`getTimeToNextGame`](https://viem.sh/op-stack/actions/getTimeToNextGame) (supersedes `getTimeToNextL2Output`)
- [`waitForNextGame`](https://viem.sh/op-stack/actions/waitForNextGame) (supersedes `waitForNextL2Output`)

> Note: The above actions are only compatible with OP Stack chains which have upgraded to Fault Proofs.