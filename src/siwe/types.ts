// TODO: Link specs
// TODO: examples
export type Message = {
  /**
   * Ethereum address performing the signing conformant to capitalization encoded checksum specified in EIP-55 where applicable.
   */
  address: string
  /**
   * EIP-155 Chain ID to which the session is bound, and the network where Contract Accounts must be resolved.
   */
  chainId: number
  /**
   * RFC 4501 dns authority that is requesting the signing.
   */
  domain: string
  /**
   * ISO 8601 datetime string that, if present, indicates when the signed authentication message is no longer valid.
   */
  expirationTime?: string | undefined
  /**
   * ISO 8601 datetime string of the current time.
   */
  issuedAt?: string | undefined
  /**
   * Randomized token used to prevent replay attacks, at least 8 alphanumeric characters.
   */
  nonce: string
  /**
   * ISO 8601 datetime string that, if present, indicates when the signed authentication message will become valid.
   */
  notBefore?: string | undefined
  /**
   * System-specific identifier that may be used to uniquely refer to the sign-in request.
   */
  requestId?: string | undefined
  /**
   * List of information or references to information the user wishes to have resolved as part of authentication by the relying party. They are expressed as RFC 3986 URIs separated by `\n- `.
   */
  resources?: string[] | undefined
  /**
   * RFC 3986 URI scheme for the authority that is requesting the signing.
   */
  scheme?: string | undefined
  /**
   * Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
   */
  statement?: string | undefined
  /**
   * RFC 3986 URI referring to the resource that is the subject of the signing (as in the __subject__ of a claim).
   */
  uri: string
  /**
   * Current version of the message.
   */
  version: '1'
}
