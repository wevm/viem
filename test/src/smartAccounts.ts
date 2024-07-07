import { solady } from '../../src/accounts/implementations/solady.js'
import { toSmartAccount } from '../../src/accounts/toSmartAccount.js'
import { anvilMainnet } from './anvil.js'
import { accounts } from './constants.js'
import { deployMock4337Account_06, deployMock4337Account_07 } from './utils.js'

const client = anvilMainnet.getClient()

export async function getSmartAccounts_07() {
  const { factoryAddress } = await deployMock4337Account_07()
  return Promise.all(
    (
      [
        '0x0',
        '0x1',
        '0x2',
        '0x3',
        '0x4',
        '0x5',
        '0x6',
        '0x7',
        '0x8',
        '0x9',
      ] as const
    ).map((salt) =>
      toSmartAccount({
        client,
        implementation: solady({
          factoryAddress,
          owner: accounts[0].address,
          salt,
        }),
      }),
    ),
  )
}

export async function getSmartAccounts_06() {
  const { factoryAddress } = await deployMock4337Account_06()
  return Promise.all(
    (
      [
        '0x0',
        '0x1',
        '0x2',
        '0x3',
        '0x4',
        '0x5',
        '0x6',
        '0x7',
        '0x8',
        '0x9',
      ] as const
    ).map((salt) =>
      toSmartAccount({
        client,
        implementation: solady({
          entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
          entryPointVersion: '0.6',
          factoryAddress,
          owner: accounts[0].address,
          salt,
        }),
      }),
    ),
  )
}
