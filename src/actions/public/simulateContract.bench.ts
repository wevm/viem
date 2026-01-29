import { Contract, Typed } from 'ethers'

import { bench, describe } from 'vitest'

import { wagmiContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import { ethersProvider } from '~test/bench.js'
import { accounts } from '~test/constants.js'

import { simulateContract } from './simulateContract.js'

const client = anvilMainnet.getClient()

describe('Simulate Contract', () => {
  bench('viem: `simulateContract`', async () => {
    await simulateContract(client, {
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
