import { HDKey } from '@scure/bip32'
export { HDKey }

export { generateMnemonic } from './generateMnemonic'

export { generatePrivateKey } from './generatePrivateKey'

export { hdKeyToAccount } from './hdKeyToAccount'

export { mnemonicToAccount } from './mnemonicToAccount'

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

export type {
  SignMessageParameters,
  SignMessageReturnType,
  SignTypedDataParameters,
  SignTypedDataReturnType,
} from './utils'
export {
  parseAccount,
  publicKeyToAddress,
  signMessage,
  signTypedData,
} from './utils'

export { czech } from './wordlists/czech'
export { english } from './wordlists/english'
export { french } from './wordlists/french'
export { italian } from './wordlists/italian'
export { japanese } from './wordlists/japanese'
export { korean } from './wordlists/korean'
export { simplifiedChinese } from './wordlists/simplifiedChinese'
export { spanish } from './wordlists/spanish'
export { traditionalChinese } from './wordlists/traditionalChinese'
