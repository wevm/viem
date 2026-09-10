# EIP-8141 Frame Transaction Examples

Frame transactions ([EIP-8141](https://eips.ethereum.org/EIPS/eip-8141)) replace the
single-call transaction model with an ordered list of **frames**, each specifying an
execution mode, target, execution and state gas limits, and calldata, plus an outer
list of protocol-validated **signatures**. This enables native account abstraction,
sponsored gas, and atomic multi-operation batches at the protocol level.

## Prerequisites

These examples use the local `viem` package from this repository:

```bash
cd examples/frame-transactions
pnpm install          # links viem from ../../src
```

## RPC Endpoint

All examples target the public demo node:

```
https://rpc1.eip-8141.ethrex.xyz
https://rpc2.eip-8141.ethrex.xyz
https://rpc3.eip-8141.ethrex.xyz
```

## Running

```bash
PRIVATE_KEY=0x... pnpm tsx simple-self-verified.ts
PRIVATE_KEY=0x... pnpm tsx sponsored-transaction.ts
PRIVATE_KEY=0x... pnpm tsx atomic-batch.ts
```

`PRIVATE_KEY` defaults to the first Anvil dev key.

## Examples

| File | Scenario |
|------|----------|
| `simple-self-verified.ts` | Minimal VERIFY + SENDER flow: the protocol's default code checks the sender's signature and approves, then the sender transfers ETH |
| `sponsored-transaction.ts` | The sender approves execution only; a paymaster VERIFY frame approves payment and is repaid in ERC-20 tokens |
| `atomic-batch.ts` | Two SENDER frames linked with the atomic batch flag: ERC-20 approve then DEX swap, all-or-nothing |

## Transaction shape

```ts
const tx: TransactionSerializableEIP8141 = {
  chainId,
  nonce,
  sender,
  frames: [{ mode, flags, target, limits: { execution, state }, value, data }],
  signatures: [{ scheme, signer, msg, signature }], // optional
  maxPriorityFeePerGas,
  maxFeePerGas,
  maxFeePerBlobGas, // must be 0 / omitted without blobs
  blobVersionedHashes,
}
```

## Signing

`account.signTransaction(tx)` signs the canonical EIP-8141 signature hash
(`keccak256(0x06 || rlp(tx))` with the `signature` bytes of every entry whose
`msg` is empty elided) and stores `v || r || s` in the first `SECP256K1`
signature slot that has no explicit `signer`, appending one if needed. The
default code for accounts without code reads that slot to authorise the
transaction. `recoverTransactionAddress` recovers the sender from the same slot.

## Frame Modes

| Mode | Name | Behaviour |
|------|------|-----------|
| 0 | DEFAULT | Executes as the entry point (address `0xaa`) |
| 1 | VERIFY | Read-only validation; may call the `APPROVE` opcode |
| 2 | SENDER | Executes as `tx.sender` (requires prior approval) |

## Frame Flags

| Bits | Meaning | Valid with |
|------|---------|------------|
| 0-1 | Approval scope: `0x1` payment, `0x2` execution, `0x3` both. Execution scope requires `target` to be `null` or the sender | Any mode |
| 2 | Atomic batch: this frame and the next succeed or revert together. Batched frames may not carry an approval scope | DEFAULT, SENDER |

## Signature Schemes

| Scheme | Name | `signature` encoding |
|--------|------|----------------------|
| 0 | ARBITRARY | Arbitrary bytes, `signer` must be `null` |
| 1 | SECP256K1 | `v (1 byte) || r (32 bytes) || s (32 bytes)` |
| 2 | P256 | `r || s || qx || qy` (32 bytes each) |

`msg` is `'0x'` to sign the canonical transaction hash, or an explicit 32-byte digest.

## Receipts

Frame transaction receipts carry `payer` and per-frame `frameReceipts`, each with
`status` (`success`, `reverted`, or `skipped` for frames rolled back by a failed
atomic batch), `gasUsed` (execution gas), `stateGasUsed`, and `logs`.
