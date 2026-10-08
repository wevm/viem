import { SignatureEnvelope } from 'ox/tempo'

/** Parses a primitive multisig owner approval. */
export function parseApproval(
  signature: SignatureEnvelope.Serialized,
): SignatureEnvelope.Primitive {
  const approval = SignatureEnvelope.from(signature)
  if (
    approval.type === 'multisig' ||
    approval.type === 'keychain' ||
    approval.type === 'zk'
  )
    throw new Error('Multisig owners must use primitive signatures.')
  return approval
}
