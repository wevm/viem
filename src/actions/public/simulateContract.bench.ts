import { Contract } from 'ethers'
import { bench, describe } from 'vitest'

import {
  accounts,
  ethersProvider,
  publicClient,
  wagmiContractConfig,
} from '../../_test'

import { simulateContract } from './simulateContract'

describe('Simulate Contract', () => {
  bench('viem: `simulateContract`', async () => {
    await simulateContract(publicClient, {
      ...wagmiContractConfig,
      functionName: 'mint',
      args: [1n],
      from: accounts[0].address,
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
