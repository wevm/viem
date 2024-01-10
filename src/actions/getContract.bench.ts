import { Contract } from 'ethers'

import { bench, describe } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { ethersProvider } from '~test/src/bench.js'
import { publicClient } from '~test/src/utils.js'

import { getContract } from './getContract.js'

describe('Create contract instance', () => {
  bench('viem: `getContract`', async () => {
    getContract({
      ...wagmiContractConfig,
      client: { public: publicClient },
    })
  })

  bench('ethers: `new Contract`', async () => {
    new Contract(
      wagmiContractConfig.address,
      wagmiContractConfig.abi,
      ethersProvider,
    )
  })
})

const viemContract = getContract({
  ...wagmiContractConfig,
  client: { public: publicClient },
})
const ethersContract = new Contract(
  wagmiContractConfig.address,
  wagmiContractConfig.abi,
  ethersProvider,
)

describe('Call contract read function', () => {
  bench('viem: `contract.read.balanceOf`', async () => {
    await viemContract.read.balanceOf([
      '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    ])
  })

  bench('ethers: `contract.balanceOf`', async () => {
    await ethersContract.balanceOf('0xA0Cf798816D4b9b9866b5330EEa46a18382f251e')
  })
})
