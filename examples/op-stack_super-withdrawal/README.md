# OP Stack Super Withdrawal Example

Manual end-to-end withdrawal verification for OP Stack devnets. The same script
can run against:

- A pre-super-roots devnet where the respected Portal game type uses legacy L2
  block-number anchors.
- A post-super-roots devnet where the respected Portal game type uses L2
  timestamp anchors.

This example is intentionally not wired into CI. It requires external devnets,
funded accounts, and devnet finalization timings short enough for manual runs.

## Run

```sh
pnpm --filter example-op-stack-super-withdrawal dev
```

## Environment

Required for both legacy and super-root devnets:

```sh
export L1_RPC_URL=http://127.0.0.1:8545
export L2_RPC_URL=http://127.0.0.1:9545
export L1_CHAIN_ID=900
export L2_CHAIN_ID=901
export PRIVATE_KEY=0x...
export PORTAL_ADDRESS=0x...
export DISPUTE_GAME_FACTORY_ADDRESS=0x...
```

Required only for legacy Portal/L2OutputOracle devnets:

```sh
export L2_OUTPUT_ORACLE_ADDRESS=0x...
```

Optional:

```sh
export WITHDRAWAL_AMOUNT_WEI=1000
```

## What It Does

The script:

1. Builds initiate-withdrawal parameters.
2. Initiates the withdrawal on L2.
3. Waits for the L2 transaction receipt.
4. Reads the Portal version and respected game type to determine whether the
   devnet uses super roots.
5. Reads the L2 receipt block timestamp and passes it as `l2Timestamp` to
   `waitToProve` only for super-root devnets.
6. Builds prove-withdrawal parameters from the returned dispute game.
7. Proves the withdrawal on L1.
8. Waits for the L1 prove transaction receipt.
9. Waits until the withdrawal can be finalized.
10. Finalizes the withdrawal on L1.
11. Waits for the L1 finalize transaction receipt and logs the L1 balance delta.

For non-super devnets, the script keeps using the receipt L2 block number for
prove readiness. For post-super-roots devnets, `l2Timestamp` becomes the L1-side
anchor used to find the correct dispute game, and `buildProveWithdrawal`
resolves that timestamp back to an L2 block number for the proof RPC calls.
