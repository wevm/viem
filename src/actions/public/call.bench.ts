import { bench, describe } from 'vitest'

import {
  accounts,
  ethersProvider,
  ethersV6Provider,
  publicClient,
} from '../../_test/index.js'

import { call } from './call.js'

const wagmiContractAddress = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
const name4bytes = '0x06fdde03'

describe('Call', () => {
  bench('viem: `call`', async () => {
    await call(publicClient, {
      data: name4bytes,
      account: accounts[0].address,
      to: wagmiContractAddress,
    })
  })

  bench('ethers@5: `call`', async () => {
    await ethersProvider.call({
      data: name4bytes,
      from: accounts[0].address,
      to: wagmiContractAddress,
    })
  })

  bench('ethers@6: `call`', async () => {
    await ethersV6Provider.call({
      data: name4bytes,
      from: accounts[0].address,
      to: wagmiContractAddress,
    })
  })
})
