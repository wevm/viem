import { HDKey } from '@scure/bip32'
export { HDKey }

export { generateMnemonic } from './generateMnemonic.js'

export { generatePrivateKey } from './generatePrivateKey.js'

export { hdKeyToAccount } from './hdKeyToAccount.js'

export { mnemonicToAccount } from './mnemonicToAccount.js'

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
} from './types.js'

export type {
  SignMessageParameters,
  SignMessageReturnType,
  SignTypedDataParameters,
  SignTypedDataReturnType,
} from './utils/index.js'
export {
  parseAccount,
  publicKeyToAddress,
  signMessage,
  signTypedData,
} from './utils/index.js'

export { czech } from './wordlists/czech.js'
export { english } from './wordlists/english.js'
export { french } from './wordlists/french.js'
export { italian } from './wordlists/italian.js'
export { japanese } from './wordlists/japanese.js'
export { korean } from './wordlists/korean.js'
export { simplifiedChinese } from './wordlists/simplifiedChinese.js'
export { spanish } from './wordlists/spanish.js'
export { traditionalChinese } from './wordlists/traditionalChinese.js'
