import { bench, describe } from 'vitest'

import { erc20Abi, multicall3Abi } from '../../constants/abis.js'
import { encodeFunctionData } from './encodeFunctionData.js'

describe('Encode Function Data (ERC-20 transfer)', () => {
  bench('viem: `encodeFunctionData`', () => {
    encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 123456789n],
    })
  })
})

const calls = Array.from({ length: 100 }, (_, i) => ({
  target: `0x${(i + 1).toString(16).padStart(40, '0')}` as const,
  allowFailure: true,
  callData: `0x70a08231${(i + 1).toString(16).padStart(64, '0')}` as const,
}))

describe('Encode Function Data (multicall3 aggregate3, 100 calls)', () => {
  bench('viem: `encodeFunctionData`', () => {
    encodeFunctionData({
      abi: multicall3Abi,
      functionName: 'aggregate3',
      args: [calls],
    })
  })
})
