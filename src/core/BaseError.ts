import { BaseError as ox_BaseError } from 'ox/Errors'

import { getVersion } from './internal/errors.js'

export class BaseError<
  cause extends Error | undefined = undefined,
> extends ox_BaseError<cause> {
  override name = 'BaseError'

  constructor(shortMessage: string, options: BaseError.Options<cause> = {}) {
    super(shortMessage, {
      ...options,
      docsOrigin: options.docsOrigin ?? 'https://viem.sh',
      version: options.version ?? `viem@${getVersion()}`,
    })
  }
}

export declare namespace BaseError {
  type Options<cause extends Error | undefined = Error | undefined> =
    ox_BaseError.Options<cause>
}
