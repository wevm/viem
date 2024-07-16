import type { Address } from 'abitype'
import type { SignReturnType as WebAuthnSignReturnType } from 'webauthn-p256'

import type { Hash, Hex, SignableMessage } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'
import type { Assign } from '../../types/utils.js'
import type { SmartAccountImplementation } from './implementations/defineImplementation.js'

export type SmartAccount<
  implementation extends
    SmartAccountImplementation = SmartAccountImplementation,
> = Assign<
  implementation,
  {
    /** Address of the Smart Account. */
    address: Address
    /** Whether or not the Smart Account has been deployed. */
    isDeployed: () => Promise<boolean>
    /** Type of account. */
    type: 'smart'
  }
>

export type WebAuthnAccount = {
  publicKey: Hex
  sign: ({ hash }: { hash: Hash }) => Promise<WebAuthnSignReturnType>
  signMessage: ({
    message,
  }: { message: SignableMessage }) => Promise<WebAuthnSignReturnType>
  signTypedData: <
    const typedData extends TypedDataDefinition | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(
    typedDataDefinition: TypedDataDefinition<typedData, primaryType>,
  ) => Promise<WebAuthnSignReturnType>
  type: 'webAuthn'
}
