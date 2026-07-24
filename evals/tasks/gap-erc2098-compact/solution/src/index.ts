import { type Hex, Signature, SignatureErc2098 } from 'viem/utils'

export function toCompactSignature(options: toCompactSignature.Options) {
  return SignatureErc2098.toHex(
    SignatureErc2098.from(Signature.fromHex(options.signature)),
  )
}

export declare namespace toCompactSignature {
  type Options = {
    signature: Hex.Hex
  }
}

export function fromCompactSignature(options: fromCompactSignature.Options) {
  return SignatureErc2098.toSignature(SignatureErc2098.fromHex(options.compact))
}

export declare namespace fromCompactSignature {
  type Options = {
    compact: Hex.Hex
  }
}
