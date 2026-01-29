export type { Address } from 'abitype'

// biome-ignore lint/performance/noBarrelFile: entrypoint module
export { HDKey } from '@scure/bip32'

export {
  czech,
  english,
  french,
  italian,
  japanese,
  korean,
  portuguese,
  simplifiedChinese,
  spanish,
  traditionalChinese,
} from './wordlists.js'

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
  setSignEntropy,
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
  signAuthorization,
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
