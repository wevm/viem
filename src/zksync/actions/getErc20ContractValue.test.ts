import { erc20Abi } from 'abitype/abis'
import { afterAll, expect, test, vi } from 'vitest'
import * as readContract from '../../actions/public/readContract.js'
import { sepolia } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { publicActionsL1 } from '../decorators/publicL1.js'
import { getErc20ContractValue } from './getErc20ContractValue.js'

const tokenL1 = '0x53844F9577C2334e541Aec7Df7174ECe5dF1fCf0'
let spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(100n)

afterAll(() => {
  spy.mockRestore()
})

test('default with decimals', async () => {
  spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(18)

  const client = createClient({
    chain: sepolia,
    transport: http(),
  }).extend(publicActionsL1())

  expect(
    await getErc20ContractValue(client, {
      functionName: 'decimals',
      l1TokenAddress: tokenL1,
    }),
  ).toBe(18)

  expect(spy).toHaveBeenCalledWith(client, {
    abi: erc20Abi,
    address: tokenL1,
    functionName: 'decimals',
    args: [],
  })
})

test('default with name', async () => {
  spy = vi.spyOn(readContract, 'readContract').mockResolvedValue('Test')

  const client = createClient({
    chain: sepolia,
    transport: http(),
  }).extend(publicActionsL1())

  expect(
    await getErc20ContractValue(client, {
      functionName: 'name',
      l1TokenAddress: tokenL1,
    }),
  ).toBe('Test')

  expect(spy).toHaveBeenCalledWith(client, {
    abi: erc20Abi,
    address: tokenL1,
    functionName: 'name',
    args: [],
  })
})

test('default with symbol', async () => {
  spy = vi.spyOn(readContract, 'readContract').mockResolvedValue('T')

  const client = createClient({
    chain: sepolia,
    transport: http(),
  }).extend(publicActionsL1())

  expect(
    await getErc20ContractValue(client, {
      functionName: 'symbol',
      l1TokenAddress: tokenL1,
    }),
  ).toBe('T')

  expect(spy).toHaveBeenCalledWith(client, {
    abi: erc20Abi,
    address: tokenL1,
    functionName: 'symbol',
    args: [],
  })
})

test('default with total supply', async () => {
  spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(100000000n)

  const client = createClient({
    chain: sepolia,
    transport: http(),
  }).extend(publicActionsL1())

  expect(
    await getErc20ContractValue(client, {
      functionName: 'totalSupply',
      l1TokenAddress: tokenL1,
    }),
  ).toBe(100000000n)

  expect(spy).toHaveBeenCalledWith(client, {
    abi: erc20Abi,
    address: tokenL1,
    functionName: 'totalSupply',
    args: [],
  })
})
