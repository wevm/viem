import { Account } from 'viem'

const mnemonic = 'test test test test test test test test test test test junk'

export function example() {
  return {
    custom: Account.fromMnemonic(mnemonic, {
      path: "m/44'/60'/1'/0/0",
    }).address,
    indexed: [0, 1, 2].map(
      (addressIndex) =>
        Account.fromMnemonic(mnemonic, { addressIndex }).address,
    ),
    passphrase: Account.fromMnemonic(mnemonic, {
      passphrase: 'passphrase',
    }).address,
  }
}
