import { MultisigConfig, SignatureEnvelope } from 'ox/tempo'
import type { Hex } from '../../types/misc.js'
import type { Multisig } from '../Transaction.js'

/** @internal */
export function parseMultisigApproval(
  serialized: SignatureEnvelope.Serialized,
): SignatureEnvelope.Primitive {
  const signature = SignatureEnvelope.from(serialized)
  if (
    signature.type !== 'secp256k1' &&
    signature.type !== 'p256' &&
    signature.type !== 'webAuthn'
  )
    throw new Error('Multisig owners must use primitive signatures.')
  return signature
}

/** @internal */
export function assertMultisigConfig(multisig: Multisig, commitment: Hex) {
  if (BigInt(commitment) === 0n) {
    if (multisig.config.version !== 0n)
      throw new Error(
        'Uninitialized multisig accounts require a version-zero config.',
      )
  } else if (
    MultisigConfig.getCommitment(multisig.config).toLowerCase() !==
    commitment.toLowerCase()
  )
    throw new Error('Multisig config does not match the on-chain commitment.')
}

/** @internal */
export function getMultisigSimulation(config: MultisigConfig.Config) {
  // Maximize the approval count without adding signatures after quorum is reached.
  const prefixes = new Map<number, typeof config.owners>([[0, []]])
  let quorum: typeof config.owners = []
  for (const owner of config.owners) {
    for (const [weight, owners] of [...prefixes]) {
      const next = [...owners, owner]
      const total = weight + owner.weight
      if (total >= config.threshold) {
        if (next.length > quorum.length) quorum = next
      } else if (next.length > (prefixes.get(total)?.length ?? -1))
        prefixes.set(total, next)
    }
  }
  return { config, approvals: quorum.map(({ owner }) => ({ owner })) }
}
