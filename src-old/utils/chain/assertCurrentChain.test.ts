import { expect, test } from 'vitest'

import { mainnet, optimism } from '../../chains/index.js'

import { assertCurrentChain } from './assertCurrentChain.js'

test('matching chains', () => {
  assertCurrentChain({ currentChainId: mainnet.id, chain: mainnet })
  assertCurrentChain({ currentChainId: optimism.id, chain: optimism })
})

test('chain mismatch', () => {
  expect(() =>
    assertCurrentChain({ currentChainId: mainnet.id, chain: optimism }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [ChainMismatchError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – OP Mainnet).

    Current Chain ID:  1
    Expected Chain ID: 10 – OP Mainnet

    Version: viem@x.y.z]
  `)
  expect(() =>
    assertCurrentChain({ currentChainId: optimism.id, chain: mainnet }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [ChainMismatchError: The current chain of the wallet (id: 10) does not match the target chain for the transaction (id: 1 – Ethereum).

    Current Chain ID:  10
    Expected Chain ID: 1 – Ethereum

    Version: viem@x.y.z]
  `)
})

test('no chain', () => {
  expect(() =>
    assertCurrentChain({ currentChainId: mainnet.id }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [ChainNotFoundError: No chain was provided to the request.
    Please provide a chain with the \`chain\` argument on the Action, or by supplying a \`chain\` to WalletClient.

    Version: viem@x.y.z]
  `)
  expect(() =>
    assertCurrentChain({ currentChainId: optimism.id }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [ChainNotFoundError: No chain was provided to the request.
    Please provide a chain with the \`chain\` argument on the Action, or by supplying a \`chain\` to WalletClient.

    Version: viem@x.y.z]
  `)
})
