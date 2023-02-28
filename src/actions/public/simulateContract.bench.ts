import { Contract } from 'ethers'
import { Contract as ContractV6 } from 'ethers@6'
import { bench, describe } from 'vitest'
import { getAccount } from '../../utils'

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
      account: getAccount(accounts[0].address),
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

  bench('ethers@6: `callStatic`', async () => {
    const wagmi = new ContractV6(
      wagmiContractConfig.address,
      wagmiContractConfig.abi,
      ethersProvider,
    )
    await wagmi.mint.staticCall(1)
  })
})
