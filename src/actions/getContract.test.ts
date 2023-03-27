import { expect, test } from 'vitest'

import {
  wagmiContractConfig,
  publicClient,
  walletClient,
  accounts,
} from '../_test'
import { getContract } from './getContract'

// TODO
// - runtime `createEventFilter` and `watchEvent` methods
// - docs, twoslash

const contract = getContract({
  ...wagmiContractConfig,
  publicClient,
  walletClient,
})

test('createEventFilter', async () => {
  await expect(
    contract.createEventFilter.Transfer({
      from: accounts[0].address,
    }),
  ).resolves.toBeDefined()

  const contractNoIndexedEventArgs = getContract({
    ...wagmiContractConfig,
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            type: 'address',
          },
          { indexed: false, type: 'address' },
          {
            indexed: true,
            type: 'uint256',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
    ],
    publicClient,
  })
  await expect(
    contractNoIndexedEventArgs.createEventFilter.Transfer({
      from: accounts[0].address,
    }),
  ).resolves.toBeDefined()
})

test('estimateGas', async () => {
  await expect(
    contract.estimateGas.mint({
      account: accounts[0].address,
    }),
  ).resolves.toBeDefined()
})

test('read', async () => {
  await expect(
    contract.read.balanceOf([accounts[0].address]),
  ).resolves.toBeDefined()
})

test('simulate', async () => {
  const contract = getContract({
    ...wagmiContractConfig,
    abi: wagmiContractConfig.abi.filter(
      (x) => (x as { name: string }).name === 'mint',
    ),
    publicClient,
    walletClient,
  })
  await expect(
    contract.simulate.mint({
      account: accounts[0].address,
    }),
  ).resolves.toMatchInlineSnapshot(`
    {
      "request": {
        "abi": [
          {
            "inputs": [],
            "name": "mint",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256",
              },
            ],
            "name": "mint",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
        ],
        "account": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
        "args": [],
        "functionName": "mint",
      },
      "result": undefined,
    }
  `)
})

test.todo('watchEvent')

test('write', async () => {
  await expect(
    contract.write.mint({
      account: accounts[0].address,
    }),
  ).resolves.toBeDefined()
})

test.todo('js reserved keywords/prototype methods as abi item names')
