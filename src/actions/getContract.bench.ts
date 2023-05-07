import { Contract } from 'ethers'

import { Contract as Contractv6 } from 'ethers@6'

import { bench, describe } from 'vitest'

import { wagmiContractConfig } from '../_test/abis.js'
import { ethersProvider, ethersV6Provider } from '../_test/bench.js'
import { publicClient } from '../_test/utils.js'

import { getContract } from './getContract.js'

describe('Create contract instance', () => {
  bench('viem: `getContract`', async () => {
    getContract({
      ...wagmiContractConfig,
      publicClient,
    })
  })

  bench('ethers@5: `new Contract`', async () => {
    new Contract(
      wagmiContractConfig.address,
      wagmiContractConfig.abi,
      ethersProvider,
    )
  })

  bench('ethers@6: `new Contract`', async () => {
    new Contractv6(
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
