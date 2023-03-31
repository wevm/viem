import { HDKey } from '@scure/bip32'

export { HDKey }

export { generateMnemonic } from './generateMnemonic.js'

export { generatePrivateKey } from './generatePrivateKey.js'

export { privateKeyToAccount } from './privateKeyToAccount.js'

export { toAccount } from './toAccount.js'

export type {
  Account,
  AccountSource,
  CustomSource,
  HDOptions,
  JsonRpcAccount,
  LocalAccount,
  HDAccount,
  PrivateKeyAccount,
} from '../types/index.js'

export type {
  SignMessageParameters,
  SignMessageReturnType,
  SignTypedDataParameters,
  SignTypedDataReturnType,
} from '../actions/wallet/index.js'
export {
  parseAccount,
  publicKeyToAddress,
  signMessage,
  signTypedData,
} from '../accounts/utils/index.js'

export {
  czech,
  english,
  french,
  italian,
  japanese,
  korean,
  simplifiedChinese,
  spanish,
  traditionalChinese,
} from './wordlists.js'
