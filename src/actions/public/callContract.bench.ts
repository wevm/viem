import { Contract } from 'ethers'
import { bench, describe } from 'vitest'

import { ethersProvider, publicClient, wagmiContractConfig } from '../../_test'

import { callContract } from './callContract'

describe('Call Contract', () => {
  bench('viem: `callContract`', async () => {
    await callContract(publicClient, {
      ...wagmiContractConfig,
      functionName: 'totalSupply',
    })
  })

  bench('ethers: `callStatic`', async () => {
    const wagmi = new Contract(
      wagmiContractConfig.address,
      wagmiContractConfig.abi,
      ethersProvider,
    )
    await wagmi.callStatic.mint(1)
  })
})
