import { HDKey } from '@scure/bip32'

export { HDKey }

export { privateKeyToAccount } from './privateKeyToAccount'

export { toAccount } from './toAccount'

export type {
  Account,
  AccountSource,
  CustomSource,
  HDOptions,
  JsonRpcAccount,
  LocalAccount,
  HDAccount,
  PrivateKeyAccount,
} from './types'

export type { SignMessageParameters, SignMessageReturnType } from './utils'
export { parseAccount, publicKeyToAddress, signMessage } from './utils'
