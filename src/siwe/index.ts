// biome-ignore lint/performance/noBarrelFile: entrypoint module
export {
  type VerifySiweMessageErrorType,
  type VerifySiweMessageParameters,
  type VerifySiweMessageReturnType,
  verifySiweMessage,
} from '../actions/siwe/verifySiweMessage.js'
export {
  SiweInvalidMessageFieldError,
  type SiweInvalidMessageFieldErrorType,
} from '../errors/siwe.js'
export {
  type CreateSiweMessageErrorType,
  type CreateSiweMessageParameters,
  type CreateSiweMessageReturnType,
  createSiweMessage,
} from '../utils/siwe/createSiweMessage.js'
export { generateSiweNonce } from '../utils/siwe/generateSiweNonce.js'
export { parseSiweMessage } from '../utils/siwe/parseSiweMessage.js'

export type { SiweMessage } from '../utils/siwe/types.js'
export {
  type ValidateSiweMessageParameters,
  type ValidateSiweMessageReturnType,
  validateSiweMessage,
} from '../utils/siwe/validateSiweMessage.js'
