import { solady } from '../../src/experimental/erc4337/accounts/implementations/solady.js'
import { toSmartAccount } from '../../src/experimental/erc4337/accounts/toSmartAccount.js'
import { anvilMainnet } from './anvil.js'
import { accounts } from './constants.js'
import { deployMock4337Account } from './utils.js'

const client = anvilMainnet.getClient()

export async function getSmartAccounts() {
  const { factoryAddress } = await deployMock4337Account()
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
