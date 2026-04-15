# EIP-8141 Frame Transaction Examples

Frame transactions ([EIP-8141](https://eips.ethereum.org/EIPS/eip-8141)) replace the
single-call transaction model with an ordered list of **frames**, each specifying an
execution mode, target, gas budget, and calldata. This enables native account abstraction,
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
https://demo.eip-8141.ethrex.xyz/rpc
```

## Running

```bash
pnpm tsx simple-self-verified.ts
pnpm tsx sponsored-transaction.ts
pnpm tsx atomic-batch.ts
```

## Examples

| File | Scenario |
|------|----------|
| `simple-self-verified.ts` | Minimal VERIFY + SENDER flow: the sender's validator approves, then the sender executes a call |
| `sponsored-transaction.ts` | Third-party pays gas via a DEFAULT frame running paymaster logic at the entry point |
| `atomic-batch.ts` | Two SENDER frames linked with the atomic batch flag: ERC-20 approve then DEX swap, all-or-nothing |

## Frame Modes

| Mode | Name | Behaviour |
|------|------|-----------|
| 0 | DEFAULT | Executes as the entry point (address `0xaa`) |
| 1 | VERIFY | Read-only validation; must call the `APPROVE` opcode |
| 2 | SENDER | Executes as `tx.sender` (requires prior approval) |
