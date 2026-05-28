import { BaseError } from '../errors/base.js'

type AccessKeyErrorParameters = {
  cause?: BaseError | Error | undefined
}

export type AccessKeyExpiredErrorType = AccessKeyExpiredError & {
  name: 'AccessKeyExpiredError'
}
export class AccessKeyExpiredError extends BaseError {
  static nodeMessage =
    /accesskeyexpired|access key expired|keyexpired|key expired|expired key|expiry in past|expiryinpast|access key expiry|key expires too soon/

  override name = 'AccessKeyExpiredError' as const

  constructor({ cause }: AccessKeyErrorParameters = {}) {
    super('Access key expired.', {
      cause,
      docsPath: '/tempo/access-keys',
      metaMessages: [
        'The access key can no longer authorize transactions for this account.',
      ],
      name: 'AccessKeyExpiredError',
    })
  }
}

export type AccessKeyRevokedErrorType = AccessKeyRevokedError & {
  name: 'AccessKeyRevokedError'
}
export class AccessKeyRevokedError extends BaseError {
  static nodeMessage =
    /accesskeyrevoked|access key revoked|keyalreadyrevoked|key already revoked|key revoked|revoked key/

  override name = 'AccessKeyRevokedError' as const

  constructor({ cause }: AccessKeyErrorParameters = {}) {
    super('Access key revoked.', {
      cause,
      docsPath: '/tempo/access-keys',
      metaMessages: [
        'The access key can no longer authorize transactions for this account.',
      ],
      name: 'AccessKeyRevokedError',
    })
  }
}

export type AccessKeyNotAuthorizedErrorType = AccessKeyNotAuthorizedError & {
  name: 'AccessKeyNotAuthorizedError'
}
export class AccessKeyNotAuthorizedError extends BaseError {
  static nodeMessage =
    /accesskeynotauthorized|access key is not authorized|access key not authorized|keynotfound|key not found|unauthorized key|keychain validation failed|not authorized/

  override name = 'AccessKeyNotAuthorizedError' as const

  constructor({ cause }: AccessKeyErrorParameters = {}) {
    super('Access key is not authorized.', {
      cause,
      docsPath: '/tempo/access-keys',
      metaMessages: [
        'The access key is not currently authorized for this account.',
      ],
      name: 'AccessKeyNotAuthorizedError',
    })
  }
}

export type AccessKeyInvalidSignatureErrorType =
  AccessKeyInvalidSignatureError & {
    name: 'AccessKeyInvalidSignatureError'
  }
export class AccessKeyInvalidSignatureError extends BaseError {
  static nodeMessage =
    /accesskeyrecoveryfailed|failed to recover access key|invalid keychain signature|keychain signature validation failed|invalid p256 signature|p256 signature verification failed|invalid webauthn signature|webauthn signature verification failed/

  override name = 'AccessKeyInvalidSignatureError' as const

  constructor({ cause }: AccessKeyErrorParameters = {}) {
    super('Access key signature is invalid.', {
      cause,
      docsPath: '/tempo/access-keys',
      name: 'AccessKeyInvalidSignatureError',
    })
  }
}

export type AccessKeyInvalidAuthorizationErrorType =
  AccessKeyInvalidAuthorizationError & {
    name: 'AccessKeyInvalidAuthorizationError'
  }
export class AccessKeyInvalidAuthorizationError extends BaseError {
  static nodeMessage =
    /accesskeycannotauthorizeotherkeys|access keys cannot authorize other keys|keyauthorization|key authorization|signaturetypemismatch|signature type mismatch|invalid signature type|invalidkeyauthorizationwitness|invalid key authorization witness|keyauthorizationwitnessalreadyburned|key authorization witness already burned|chain_id mismatch|chain id mismatch|not signed by root|key type does not match/

  override name = 'AccessKeyInvalidAuthorizationError' as const

  constructor({ cause }: AccessKeyErrorParameters = {}) {
    super('Access key authorization is invalid.', {
      cause,
      docsPath: '/tempo/access-keys',
      name: 'AccessKeyInvalidAuthorizationError',
    })
  }
}

export type AccessKeyErrorType =
  | AccessKeyExpiredErrorType
  | AccessKeyRevokedErrorType
  | AccessKeyNotAuthorizedErrorType
  | AccessKeyInvalidSignatureErrorType
  | AccessKeyInvalidAuthorizationErrorType

export type InvalidFeeTokenErrorType = InvalidFeeTokenError & {
  name: 'InvalidFeeTokenError'
}
export class InvalidFeeTokenError extends BaseError {
  constructor({
    cause,
    token,
  }: {
    cause?: BaseError | Error | undefined
    token: string
  }) {
    super(`Fee token "${token}" is invalid.`, {
      cause,
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: [
        'Fee tokens must be unpaused USD-denominated TIP-20 tokens.',
        'Use `client.fee.validateToken({ token })` before sending transactions or setting fee preferences.',
      ],
      name: 'InvalidFeeTokenError',
    })
  }
}

export type FeeTokenNotTip20ErrorType = FeeTokenNotTip20Error & {
  name: 'FeeTokenNotTip20Error'
}
export class FeeTokenNotTip20Error extends BaseError {
  constructor({ token }: { token: string }) {
    super(`Fee token "${token}" is not a TIP-20 token.`, {
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: [
        'Fee tokens must be TIP-20 token addresses or token IDs.',
        'TIP-20 token addresses use the `0x20c0...` address prefix.',
      ],
      name: 'FeeTokenNotTip20Error',
    })
  }
}

export type FeeTokenNotUsdErrorType = FeeTokenNotUsdError & {
  name: 'FeeTokenNotUsdError'
}
export class FeeTokenNotUsdError extends BaseError {
  constructor({
    currency,
    token,
  }: {
    currency: string
    token: string
  }) {
    super(`Fee token "${token}" is denominated in "${currency}", not "USD".`, {
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: [
        'Only USD-denominated TIP-20 tokens can be used as fee tokens.',
      ],
      name: 'FeeTokenNotUsdError',
    })
  }
}

export type FeeTokenPausedErrorType = FeeTokenPausedError & {
  name: 'FeeTokenPausedError'
}
export class FeeTokenPausedError extends BaseError {
  constructor({ token }: { token: string }) {
    super(`Fee token "${token}" is paused.`, {
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: ['Paused TIP-20 tokens cannot be used as fee tokens.'],
      name: 'FeeTokenPausedError',
    })
  }
}
