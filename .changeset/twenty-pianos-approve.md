---
"viem": minor
---

**Breaking:** Removed `ethersWalletToAccount` adapter.

This adapter was introduced when viem did not have Private Key & HD Accounts. Since 0.2, viem provides all the utilities needed to create and import [Private Key](https://viem.sh/docs/accounts/privateKey.html) & [HD Accounts](https://viem.sh/docs/accounts/mnemonic.html).

If you still need it, you can copy + paste the [old implementation](https://github.com/wagmi-dev/viem/blob/a9a71507032db896295fa1f3fa2dd6c2bdc85137/src/adapters/ethers.ts).
