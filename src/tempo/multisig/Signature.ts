import { SignatureEnvelope } from 'ox/tempo'

/** Parses a multisig owner approval (a primitive or ZK signature). */
export function parseApproval(
  signature: SignatureEnvelope.Serialized,
): SignatureEnvelope.MultisigApproval {
  const approval = SignatureEnvelope.from(signature)
  if (approval.type === 'multisig' || approval.type === 'keychain')
    throw new Error('Multisig owners must use primitive or ZK signatures.')
  return approval
}
