export type { Address } from 'abitype'

// biome-ignore lint/performance/noBarrelFile: entrypoint module
export { HDKey } from '@scure/bip32'
export { wordlist as czech } from '@scure/bip39/wordlists/czech'
export { wordlist as english } from '@scure/bip39/wordlists/english'
export { wordlist as french } from '@scure/bip39/wordlists/french'
export { wordlist as italian } from '@scure/bip39/wordlists/italian'
export { wordlist as japanese } from '@scure/bip39/wordlists/japanese'
export { wordlist as korean } from '@scure/bip39/wordlists/korean'
export { wordlist as portuguese } from '@scure/bip39/wordlists/portuguese'
export { wordlist as simplifiedChinese } from '@scure/bip39/wordlists/simplified-chinese'
export { wordlist as spanish } from '@scure/bip39/wordlists/spanish'
export { wordlist as traditionalChinese } from '@scure/bip39/wordlists/traditional-chinese'

export {
  type GenerateMnemonicErrorType,
  generateMnemonic,
} from './generateMnemonic.js'
export {
  type GeneratePrivateKeyErrorType,
  generatePrivateKey,
} from './generatePrivateKey.js'
export {
  type HDKeyToAccountOptions,
  type HDKeyToAccountErrorType,
  hdKeyToAccount,
} from './hdKeyToAccount.js'
export {
  type MnemonicToAccountOptions,
  type MnemonicToAccountErrorType,
  mnemonicToAccount,
} from './mnemonicToAccount.js'
export {
  type PrivateKeyToAccountOptions,
  type PrivateKeyToAccountErrorType,
  privateKeyToAccount,
} from './privateKeyToAccount.js'
export { type ToAccountErrorType, toAccount } from './toAccount.js'

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
export {
  type SignErrorType,
  type SignParameters,
  type SignReturnType,
  sign,
} from './utils/sign.js'
export {
  /** @deprecated Use `SignatureToHexErrorType` instead. */
  type SerializeSignatureErrorType as SignatureToHexErrorType,
  /** @deprecated Use `serializeSignature` instead. */
  serializeSignature as signatureToHex,
  type SerializeSignatureErrorType,
  serializeSignature,
} from '../utils/signature/serializeSignature.js'
export {
  type SignAuthorizationErrorType,
  type SignAuthorizationParameters,
  type SignAuthorizationReturnType,
  experimental_signAuthorization,
} from './utils/signAuthorization.js'
export {
  type SignMessageErrorType,
  type SignMessageParameters,
  type SignMessageReturnType,
  signMessage,
} from './utils/signMessage.js'
export {
  type SignTransactionErrorType,
  type SignTransactionParameters,
  type SignTransactionReturnType,
  signTransaction,
} from './utils/signTransaction.js'
export {
  type SignTypedDataErrorType,
  type SignTypedDataParameters,
  type SignTypedDataReturnType,
  signTypedData,
} from './utils/signTypedData.js'
export {
  type ParseAccountErrorType,
  parseAccount,
} from './utils/parseAccount.js'
export {
  type PublicKeyToAddressErrorType,
  publicKeyToAddress,
} from './utils/publicKeyToAddress.js'
export {
  type PrivateKeyToAddressErrorType,
  privateKeyToAddress,
} from './utils/privateKeyToAddress.js'
export {
  type CreateNonceManagerParameters,
  type NonceManager,
  type NonceManagerSource,
  createNonceManager,
  nonceManager,
} from '../utils/nonceManager.js'
