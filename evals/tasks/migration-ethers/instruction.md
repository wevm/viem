This project is moving off the `ethers` package. It has already been removed
from the dependencies, so `src/payments.ts` no longer compiles.

Rewrite `src/payments.ts` using the `viem` library already installed in this
project. Keep the exported function names and parameters unchanged, and
preserve what each function does: `getBalance` returns the address's balance
formatted in ether, `sendPayment` sends the payment and waits for the mined
receipt, and `getBlockNumber` returns the current block number. An Ethereum
mainnet RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
