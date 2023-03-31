import { bench, describe } from 'vitest'
import { Contract as Contractv6 } from 'ethers@6'
import { Contract } from 'ethers'

import {
  ethersProvider,
  ethersV6Provider,
  publicClient,
  wagmiContractConfig,
} from '../_test/index.js'

import { getContract } from './getContract.js'

describe('Create contract instance', () => {
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

const viemContract = getContract({
  ...wagmiContractConfig,
  publicClient,
})
const ethersV5Contract = new Contract(
  wagmiContractConfig.address,
  wagmiContractConfig.abi,
  ethersProvider,
)
const ethersV6Contract = new Contractv6(
  wagmiContractConfig.address,
  wagmiContractConfig.abi,
  ethersV6Provider,
)

describe('Call contract read function', () => {
  bench('viem: `contract.read.balanceOf`', async () => {
    await viemContract.read.balanceOf([
      '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    ])
  })

  bench('ethers@5: `contract.balanceOf`', async () => {
    await ethersV5Contract.balanceOf(
      '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    )
  })

  bench('ethers@6: `contract.balanceOf`', async () => {
    await ethersV6Contract.balanceOf(
      '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    )
  })
})
