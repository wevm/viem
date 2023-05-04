import { ethersProvider, ethersV6Provider } from '../../_test/bench.js'
import { publicClient, setBlockNumber } from '../../_test/utils.js'
import { getEnsName } from './getEnsName.js'
import { beforeAll, bench, describe } from 'vitest'

beforeAll(async () => {
  await setBlockNumber(16773780n)
})

describe('Get ENS Name', () => {
  bench('viem: `getEnsName`', async () => {
    await getEnsName(publicClient, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    })
  })

  bench('ethers: `lookupAddress`', async () => {
    await ethersProvider.lookupAddress(
      '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    )
  })

  bench('ethers@6: `lookupAddress`', async () => {
    await ethersV6Provider.lookupAddress(
      '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    )
  })
})
