import { Contract } from 'ethers'

import { bench, describe } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { ethersProvider } from '~test/src/bench.js'

import { anvilMainnet } from '../../test/src/anvil.js'
import { getContract } from './getContract.js'

const client = anvilMainnet.getClient()

describe('Create contract instance', () => {
  bench('viem: `getContract`', async () => {
    getContract({
      ...wagmiContractConfig,
      client,
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
  client,
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
