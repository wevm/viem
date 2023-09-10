import { Wallet } from 'ethers'
import { bench, describe } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'

import { signTypedData } from './signTypedData.js'

const wallet = new Wallet(accounts[0].privateKey)

describe('Sign Typed Data', () => {
  bench('viem: `signTypedData`', async () => {
    await signTypedData({
      ...typedData.complex,
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    })
  })

  bench('ethers: `Wallet.signTypedData`', async () => {
    await wallet.signTypedData(
      typedData.complex.domain,
      typedData.complex.types as any,
      typedData.complex.message,
    )
  })
})
