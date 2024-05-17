import { BaseError } from './base.js'

export type SiweInvalidDomainErrorType = SiweInvalidDomainError & {
  name: 'SiweInvalidDomainError'
}
export class SiweInvalidDomainError extends BaseError {
  override name = 'SwieInvalidDomainError'
  constructor(parameters: { docsPath?: string | undefined; domain: string }) {
    const { docsPath, domain } = parameters
    super(
      ['Invalid domain.', 'Domain must be valid RFC 4501 DNS authority.'].join(
        '\n',
      ),
      {
        docsPath,
        docsSlug: 'TODO',
      },
    )
  }
}

export type SiweInvalidNonceErrorType = SiweInvalidNonceError & {
  name: 'SiweInvalidNonceError'
}
export class SiweInvalidNonceError extends BaseError {
  override name = 'SwieInvalidNonceError'
  constructor(parameters: { docsPath?: string | undefined; nonce: string }) {
    const { docsPath, nonce } = parameters
    super(
      [
        'Invalid nonce.',
        'Nonce must be more 8 or more alphanumeric characters.',
      ].join('\n'),
      {
        docsPath,
        docsSlug: 'TODO',
      },
    )
  }
}

export type SiweInvalidUriErrorType = SiweInvalidUriError & {
  name: 'SiweInvalidUriError'
}
export class SiweInvalidUriError extends BaseError {
  override name = 'SwieInvalidUriError'
  constructor(parameters: { docsPath?: string | undefined; uri: string }) {
    const { docsPath, uri } = parameters
    super(
      [
        'Invalid URI.',
        'URI must be valid RFC 3986 URI referring to the resource that is the subject of the signing.',
      ].join('\n'),
      {
        docsPath,
        docsSlug: 'TODO',
      },
    )
  }
}

export type SiweInvalidVersionErrorType = SiweInvalidVersionError & {
  name: 'SiweInvalidVersionError'
}
export class SiweInvalidVersionError extends BaseError {
  override name = 'SwieInvalidVersionError'
  constructor(parameters: { docsPath?: string | undefined; version: string }) {
    const { docsPath, version } = parameters
    super(['Invalid version.', "Version must be '1'."].join('\n'), {
      docsPath,
      docsSlug: 'TODO',
    })
  }
}

export type SiweInvalidISO8601ErrorType = SiweInvalidISO8601Error & {
  name: 'SiweInvalidISO8601Error'
}
export class SiweInvalidISO8601Error extends BaseError {
  override name = 'SwieInvalidISO8601Error'
  constructor(parameters: {
    docsPath?: string | undefined
    name: string
    value: string
  }) {
    const { docsPath, name, value } = parameters
    super(
      [
        'Invalid ISO 8601 value.',
        `Value "${value}" for name "${name}" is not a valid ISO 8601 date.`,
      ].join('\n'),
      {
        docsPath,
        docsSlug: 'TODO',
      },
    )
  }
}
