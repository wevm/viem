import { seaportAbi } from 'abitype/test'
import { test } from 'vitest'
import { mainnet } from '../chains'

import {
  createClient,
  createPublicClient,
  createTestClient,
  createWalletClient,
  http,
} from '../clients'
import { readContract } from './public'
import { impersonateAccount } from './test'
import { writeContract } from './wallet'

const client = createClient({
  chain: mainnet,
  transport: http(),
})
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
const walletClient = createWalletClient({
  chain: mainnet,
  transport: http(),
  account: '0x',
})
const testClient = createTestClient({
  mode: 'anvil',
  chain: mainnet,
  transport: http(),
})

test('tree shakeable with plain client', () => {
  readContract(client, {
    abi: seaportAbi,
    address: '0x',
    functionName: 'name',
  })
  writeContract(client, {
    abi: seaportAbi,
    address: '0x',
    account: '0x',
    functionName: 'incrementCounter',
  })
  // TODO: test actions work with `client`
  // impersonateAccount(client, {
  //   address: '0x',
  //   mode: 'anvil',
  // })
})

test('public client decorator', () => {
  publicClient.readContract({
    abi: seaportAbi,
    address: '0x',
    functionName: 'name',
  })
  readContract(publicClient, {
    abi: seaportAbi,
    address: '0x',
    functionName: 'name',
  })
})

test('wallet client decorator', () => {
  walletClient.writeContract({
    abi: seaportAbi,
    address: '0x',
    functionName: 'incrementCounter',
  })
  writeContract(walletClient, {
    abi: seaportAbi,
    address: '0x',
    functionName: 'incrementCounter',
  })
})

test('test client decorator', () => {
  testClient.impersonateAccount({
    address: '0x',
  })
  impersonateAccount(testClient, {
    address: '0x',
  })
})
