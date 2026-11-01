import { SignatureEnvelope } from 'ox/tempo'

/** Parses an owner approval: a primitive or an attested signature. */
export function parseApproval(
  signature: SignatureEnvelope.Serialized,
): SignatureEnvelope.OwnerApproval {
  const approval = SignatureEnvelope.from(signature)
  if (approval.type === 'configurable' || approval.type === 'keychain')
    throw new Error(
      'Configurable account owners must use primitive signatures.',
    )
  return approval
}
