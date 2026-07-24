import { Account } from 'viem'

export function deriveAddress(options: deriveAddress.Options) {
  const { addressIndex, mnemonic } = options
  return Account.fromMnemonic(mnemonic, { addressIndex }).address
}

export declare namespace deriveAddress {
  type Options = {
    addressIndex: number
    mnemonic: string
  }
}

export function deriveAddressAtPath(options: deriveAddressAtPath.Options) {
  const { mnemonic, path } = options
  return Account.fromMnemonic(mnemonic, { path }).address
}

export declare namespace deriveAddressAtPath {
  type Options = {
    mnemonic: string
    path: NonNullable<Account.fromMnemonic.Options['path']>
  }
}

export function deriveAddressWithPassphrase(
  options: deriveAddressWithPassphrase.Options,
) {
  const { mnemonic, passphrase } = options
  return Account.fromMnemonic(mnemonic, { passphrase }).address
}

export declare namespace deriveAddressWithPassphrase {
  type Options = {
    mnemonic: string
    passphrase: string
  }
}
