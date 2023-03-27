import { bench, describe } from 'vitest'
import { Contract as Contractv6 } from 'ethers@6'
import { Contract } from 'ethers'

import {
  ethersProvider,
  ethersV6Provider,
  publicClient,
  wagmiContractConfig,
} from '../_test'

import { getContract } from './getContract'

describe('Contract instance', () => {
  bench('viem: `getContract`', async () => {
    const _contract = getContract({
      ...wagmiContractConfig,
      publicClient,
    })
  })

  bench('ethers@5: `new Contract`', async () => {
    const _contract = new Contract(
      wagmiContractConfig.address,
      wagmiContractConfig.abi,
      ethersProvider,
    )
  })

  bench('ethers@6: `new Contract`', async () => {
    const _contract = new Contractv6(
      wagmiContractConfig.address,
      wagmiContractConfig.abi,
      ethersV6Provider,
    )
  })
})
