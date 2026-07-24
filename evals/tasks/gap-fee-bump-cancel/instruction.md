Our wallet backend needs a "redirect while pending" flow: when a transfer is
still waiting to be mined, we replace it with a higher-fee transfer to a
corrected recipient.

Implement `replaceTransfer` in `src/index.ts`. It receives a Viem client first
and an options object containing a sender (an unlocked dev account on the
node), original recipient, replacement recipient, and transfer value in wei.
It must:

1. Disable the node's automatic block mining (it is enabled by default) so the
   first transfer stays pending.
2. Send `value` wei from `sender` to `originalRecipient`.
3. While that transfer is pending, displace it: send `value` wei from the same
   `sender` to `replacementRecipient`, reusing the same nonce with fees raised
   enough for the node to accept the replacement.
4. Mine a block so the replacement is included, then re-enable automatic
   mining.
5. Return `{ originalHash, replacementHash, landedHash }`, where `landedHash`
   is the hash of whichever transfer actually landed on chain (determine it by
   querying the node, not by assumption).

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545` (an Anvil dev node forking
mainnet; the standard Anvil dev/test RPC methods are available). Do not add
any new dependencies.

When you are done, `npm run build` must pass.
