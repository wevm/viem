Our test harness needs to prove that queued transfers land together in a
single block.

Implement `queueAndMineTransfers` in `src/index.ts` with this behavior:

1. Pause the node's automatic per-transaction mining.
2. Send three separate transfers of `amountEther` ETH each, from the account
   bound to the supplied client to the `to` address. With mining paused, all
   three must end up waiting in the node's transaction pool.
3. Record how many transactions are then pending in the pool.
4. Mine exactly one block so the queued transfers are included.
5. Restore automatic mining, even if an earlier step throws.

Return `{ pooledBefore, minedTxCount }`, where `pooledBefore` is the pending
count recorded in step 3 and `minedTxCount` is the number of transactions in
the newly mined block. The function receives the account-bound Viem client
first and an options object containing the recipient address and decimal ether
amount.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint (an Anvil node with test/cheatcode methods enabled) is available
at `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
