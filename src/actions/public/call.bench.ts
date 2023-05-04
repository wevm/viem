import { ethersProvider } from '../../_test/bench.js'
import { ethersV6Provider } from '../../_test/bench.js'
import { accounts } from '../../_test/constants.js'
import { publicClient } from '../../_test/utils.js'
import { call } from './call.js'
import { bench, describe } from 'vitest'

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
