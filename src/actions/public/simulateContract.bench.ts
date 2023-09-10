import { Contract, Typed } from 'ethers'

import { bench, describe } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { ethersProvider } from '~test/src/bench.js'
import { accounts } from '~test/src/constants.js'
import { publicClient } from '~test/src/utils.js'

import { simulateContract } from './simulateContract.js'

describe('Simulate Contract', () => {
  bench('viem: `simulateContract`', async () => {
    await simulateContract(publicClient, {
      ...wagmiContractConfig,
      functionName: 'mint',
      args: [42111n],
      account: accounts[0].address,
    })
  })

  bench('ethers: `callStatic`', async () => {
    const wagmi = new Contract(
      wagmiContractConfig.address,
      wagmiContractConfig.abi,
      ethersProvider,
    )
    await wagmi.mint.staticCall(Typed.uint(42111), {
      from: accounts[0].address,
    })
  })
})
