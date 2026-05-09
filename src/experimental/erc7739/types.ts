import type { Address } from 'abitype'

export type GetVerifierParameter<
  verifier extends Address | undefined = Address,
> = verifier extends Address
  ? { verifier?: Address | undefined }
  : { verifier: Address }
