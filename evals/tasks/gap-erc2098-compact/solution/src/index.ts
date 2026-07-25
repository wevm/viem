import { Signature, SignatureErc2098 } from 'viem/utils'

export function example() {
  const compact = SignatureErc2098.toHex(
    SignatureErc2098.from(
      Signature.fromHex(
        '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f5507931c',
      ),
    ),
  )
  return {
    compact,
    signature: SignatureErc2098.toSignature(SignatureErc2098.fromHex(compact)),
  }
}
