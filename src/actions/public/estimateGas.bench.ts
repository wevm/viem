import { bench, describe } from 'vitest'

import {
  accounts,
  ethersProvider,
  ethersV6Provider,
  publicClient,
  web3Provider,
} from '../../_test'
import { getAccount, parseEther } from '../../utils'

import { estimateGas } from './estimateGas'

describe.skip('Estimate Gas', () => {
  bench('viem: `estimateGas`', async () => {
    await estimateGas(publicClient, {
      account: getAccount(accounts[0].address),
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })

  bench('ethers: `estimateGas`', async () => {
    await ethersProvider.estimateGas({
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })

  bench('ethers@6: `estimateGas`', async () => {
    await ethersV6Provider.estimateGas({
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })

  bench('web3.js: `estimateGas`', async () => {
    await web3Provider.eth.estimateGas({
      from: accounts[0].address,
      to: accounts[1].address,
      value: '1000000000000',
    })
  })
})
