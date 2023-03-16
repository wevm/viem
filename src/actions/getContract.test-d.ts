import { ExtractAbiEventNames, ExtractAbiFunctionNames } from 'abitype'
import { expectTypeOf, test } from 'vitest'
import { wagmiContractConfig, publicClient, walletClient } from '../_test'
import { getContract } from './getContract'

type ReadFunctionNames = ExtractAbiFunctionNames<
  typeof wagmiContractConfig.abi,
  'pure' | 'view'
>
type WriteFunctionNames = ExtractAbiFunctionNames<
  typeof wagmiContractConfig.abi,
  'nonpayable' | 'payable'
>
type EventNames = ExtractAbiEventNames<typeof wagmiContractConfig.abi>

test('basic', () => {
  const contract = getContract({
    //  ^?
    ...wagmiContractConfig,
    publicClient,
    walletClient,
  })

  expectTypeOf<typeof contract>().toMatchTypeOf<{
    estimateGas: {
      [_ in WriteFunctionNames]: Function
    }
    read: {
      [_ in ReadFunctionNames]: Function
    }
    simulate: {
      [_ in WriteFunctionNames]: Function
    }
    watchEvent: {
      [_ in EventNames]: Function
    }
    write: {
      [_ in WriteFunctionNames]: Function
    }
  }>()
})

test('no wallet client', () => {
  const contract = getContract({
    //  ^?
    ...wagmiContractConfig,
    publicClient,
  })

  expectTypeOf<typeof contract>().toMatchTypeOf<{
    estimateGas: {
      [_ in WriteFunctionNames]: Function
    }
    read: {
      [_ in ReadFunctionNames]: Function
    }
    simulate: {
      [_ in WriteFunctionNames]: Function
    }
    watchEvent: {
      [_ in EventNames]: Function
    }
  }>()
  expectTypeOf<typeof contract>().not.toMatchTypeOf<{
    write: {
      [_ in WriteFunctionNames]: Function
    }
  }>()
})

test('no public client', () => {
  const contract = getContract({
    //  ^?
    ...wagmiContractConfig,
    walletClient,
  })

  expectTypeOf<typeof contract>().toMatchTypeOf<{
    write: {
      [_ in WriteFunctionNames]: Function
    }
  }>()
  expectTypeOf<typeof contract>().not.toMatchTypeOf<{
    estimateGas: {
      [_ in WriteFunctionNames]: Function
    }
    read: {
      [_ in ReadFunctionNames]: Function
    }
    simulate: {
      [_ in WriteFunctionNames]: Function
    }
    watchEvent: {
      [_ in EventNames]: Function
    }
  }>()
})
