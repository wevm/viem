import { bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'
import { accounts } from '~test/src/constants.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { call } from './call.js'

const client = anvilMainnet.getClient()

const wagmiContractAddress = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
const name4bytes = '0x06fdde03'

describe('Call', () => {
  bench('viem: `call`', async () => {
    await call(client, {
      data: name4bytes,
      account: accounts[0].address,
      to: wagmiContractAddress,
    })
  })

  bench('ethers: `call`', async () => {
    await ethersProvider.call({
      data: name4bytes,
      from: accounts[0].address,
      to: wagmiContractAddress,
    })
  })
})
