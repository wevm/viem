export type { PrivateKeyAccount } from './privateKeyToAccount'
export { privateKeyToAccount } from './privateKeyToAccount'

export { toAccount } from './toAccount'

export type {
  Account,
  AccountSource,
  CustomSource,
  HDOptions,
  JsonRpcAccount,
  LocalAccount,
} from './types'

export type { SignMessageParameters, SignMessageReturnType } from './utils'
export { parseAccount, publicKeyToAddress, signMessage } from './utils'
