// biome-ignore lint/performance/noBarrelFile: entrypoint module
export { HDKey } from '@scure/bip32'
export type { Address } from 'abitype'
export {
  type CreateNonceManagerParameters,
  createNonceManager,
  type NonceManager,
  type NonceManagerSource,
  nonceManager,
} from '../utils/nonceManager.js'
export {
  /** @deprecated Use `SignatureToHexErrorType` instead. */
  type SerializeSignatureErrorType as SignatureToHexErrorType,
  type SerializeSignatureErrorType,
  /** @deprecated Use `serializeSignature` instead. */
  serializeSignature as signatureToHex,
  serializeSignature,
} from '../utils/signature/serializeSignature.js'
export {
  type GenerateMnemonicErrorType,
  generateMnemonic,
} from './generateMnemonic.js'
export {
  type GeneratePrivateKeyErrorType,
  generatePrivateKey,
} from './generatePrivateKey.js'
export {
  type HDKeyToAccountErrorType,
  type HDKeyToAccountOptions,
  hdKeyToAccount,
} from './hdKeyToAccount.js'
export {
  type MnemonicToAccountErrorType,
  type MnemonicToAccountOptions,
  mnemonicToAccount,
} from './mnemonicToAccount.js'
export {
  type PrivateKeyToAccountErrorType,
  type PrivateKeyToAccountOptions,
  privateKeyToAccount,
} from './privateKeyToAccount.js'
export { type ToAccountErrorType, toAccount } from './toAccount.js'
export type {
  Account,
  AccountSource,
  CustomSource,
  HDAccount,
  HDOptions,
  JsonRpcAccount,
  LocalAccount,
  PrivateKeyAccount,
} from './types.js'
export {
  type ParseAccountErrorType,
  parseAccount,
} from './utils/parseAccount.js'
export {
  type PrivateKeyToAddressErrorType,
  privateKeyToAddress,
} from './utils/privateKeyToAddress.js'
export {
  type PublicKeyToAddressErrorType,
  publicKeyToAddress,
} from './utils/publicKeyToAddress.js'
export {
  type SignErrorType,
  type SignParameters,
  type SignReturnType,
  setSignEntropy,
  sign,
} from './utils/sign.js'
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
