// biome-ignore lint/performance/noBarrelFile: entrypoint module
export {
  type Message as SiweMessage,
  generateNonce as generateSiweNonce,
  InvalidMessageFieldError as SiweInvalidMessageFieldError,
} from 'ox/Siwe'

export {
  verifySiweMessage,
  type VerifySiweMessageParameters,
  type VerifySiweMessageReturnType,
  type VerifySiweMessageErrorType,
} from '../actions/siwe/verifySiweMessage.js'

export {
  createSiweMessage,
  type CreateSiweMessageParameters,
  type CreateSiweMessageReturnType,
  type CreateSiweMessageErrorType,
} from '../utils/siwe/createSiweMessage.js'

export { parseSiweMessage } from '../utils/siwe/parseSiweMessage.js'

export {
  validateSiweMessage,
  type ValidateSiweMessageParameters,
  type ValidateSiweMessageReturnType,
} from '../utils/siwe/validateSiweMessage.js'

import type { Siwe } from 'ox'

export type SiweInvalidMessageFieldErrorType = Siwe.InvalidMessageFieldError & {
  name: 'SiweInvalidMessageFieldError'
}
