import { expect, test } from 'vitest'

import { ContractError } from 'viem'
import { optimism } from 'viem/chains'
import { getContractAddress, isContractCallUnavailable } from './internal.js'

const abi = [
  {
    inputs: [],
    name: 'read',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
] as const

test('resolves an explicit contract address', () => {
  expect(
    getContractAddress(
      {
        portalAddress: '0x0000000000000000000000000000000000000001',
      },
      'portal',
    ),
  ).toMatchInlineSnapshot(`"0x0000000000000000000000000000000000000001"`)
})

test('resolves a source-chain contract address', () => {
  expect(
    getContractAddress(
      { chain: { ...optimism, id: 1 }, targetChain: optimism },
      'portal',
    ),
  ).toMatchInlineSnapshot(`"0xbEb5Fc579115071764c7423A4f12eDde41f106Ed"`)
})

test('resolves from the target source when the chain is null', () => {
  expect(
    getContractAddress({ chain: null, targetChain: optimism }, 'portal'),
  ).toMatchInlineSnapshot(`"0xbEb5Fc579115071764c7423A4f12eDde41f106Ed"`)
})

test('rejects a contract from another source chain', () => {
  expect(() =>
    getContractAddress(
      { chain: { ...optimism, id: 11_155_111 }, targetChain: optimism },
      'portal',
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [Chain.DoesNotSupportContract: Chain "OP Mainnet" does not support contract "portal".

    This could be due to any of the following:
    - The chain does not have the contract "portal" configured.

    Version: viem@2.52.1]
  `)
})

test('rejects a contract without a source chain', () => {
  const targetChain = { ...optimism, sourceId: undefined }
  expect(() => getContractAddress({ chain: null, targetChain }, 'portal'))
    .toThrowErrorMatchingInlineSnapshot(`
    [Chain.DoesNotSupportContract: Chain "OP Mainnet" does not support contract "portal".

    This could be due to any of the following:
    - The chain does not have the contract "portal" configured.

    Version: viem@2.52.1]
  `)
})

test('recognizes only unavailable contract calls', () => {
  const unavailable = new ContractError.ContractFunctionExecutionError(
    new ContractError.ContractFunctionZeroDataError({ functionName: 'read' }),
    { abi, functionName: 'read' },
  )
  const reverted = new ContractError.ContractFunctionExecutionError(
    new ContractError.ContractFunctionRevertedError({
      abi,
      functionName: 'read',
      message: 'permission denied',
    }),
    { abi, functionName: 'read' },
  )

  expect([
    isContractCallUnavailable(unavailable),
    isContractCallUnavailable(reverted),
  ]).toMatchInlineSnapshot(`
    [
      true,
      false,
    ]
  `)
})
