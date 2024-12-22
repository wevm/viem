import * as Siwe from 'ox/Siwe'

export type ValidateSiweMessageParameters = Siwe.validateMessage.Value

export type ValidateSiweMessageReturnType = boolean

/**
 * @description Validates EIP-4361 message.
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 */
export function validateSiweMessage(
  parameters: ValidateSiweMessageParameters,
): ValidateSiweMessageReturnType {
  return Siwe.validateMessage(parameters)
}
