import * as Errors from 'ox/Errors'

import { version as packageVersion } from '../version.js'

/** Viem-scoped defaults applied to every {@link BaseError}. */
export type Config = {
  /**
   * Origin rendered into `See:` docs URLs.
   * @default 'https://viem.sh'
   */
  docsOrigin?: string | undefined
  /**
   * Version attribution rendered as `Version: <value>`. Set to `undefined`
   * to omit the version line.
   * @default `viem@<package version>`
   */
  version?: string | undefined
}

let config: Config = {
  docsOrigin: 'https://viem.sh',
  version: `viem@${packageVersion}`,
}

/**
 * Sets viem-scoped defaults for all {@link BaseError} instances (merge
 * semantics). Useful for consumers (e.g. wagmi) that re-attribute errors.
 * ox's global static options are never touched.
 *
 * @example
 * ```ts
 * import { Errors } from 'viem'
 *
 * Errors.setConfig({ version: 'sweetlib@1.2.3' })
 * ```
 */
export function setConfig(value: Config) {
  config = { ...config, ...value }
}

/**
 * Base error class inherited by all errors thrown by viem.
 *
 * Extends ox's `Errors.BaseError`, so every viem error is also an ox error
 * (`instanceof Errors.BaseError` holds across the stack) and ox errors
 * compose as `cause` without wrapping.
 *
 * @example
 * ```ts
 * import { Errors } from 'viem'
 *
 * throw new Errors.BaseError('An error occurred.', {
 *   docsPath: '/docs/errors',
 *   metaMessages: ['Reason: example'],
 * })
 * ```
 */
export class BaseError<
  cause extends Error | undefined = undefined,
> extends Errors.BaseError<cause> {
  override name = 'BaseError'

  /** Meta messages attached to the error. */
  metaMessages?: readonly string[] | undefined

  constructor(shortMessage: string, options: BaseError.Options<cause> = {}) {
    super(shortMessage, {
      cause: options.cause,
      details: options.details,
      docsOrigin: options.docsOrigin ?? config.docsOrigin,
      docsPath: options.docsPath,
      metaMessages: options.metaMessages
        ? [...options.metaMessages]
        : undefined,
      version: options.version ?? config.version,
    })
    this.metaMessages = options.metaMessages?.filter(
      (x): x is string => typeof x === 'string',
    )
  }
}

export declare namespace BaseError {
  type Options<cause extends Error | undefined = Error | undefined> = {
    /** An error (viem, ox, or foreign) to attach as the failure cause. */
    cause?: cause | undefined
    /** Details of the error (derived from `cause` when omitted). */
    details?: string | undefined
    /** Docs origin override (defaults to the {@link Config} origin). */
    docsOrigin?: string | undefined
    /** Docs path appended to the origin and rendered as `See: <url>`. */
    docsPath?: string | undefined
    /** Meta messages rendered between the short message and the detail block. */
    metaMessages?: readonly (string | undefined)[] | undefined
    /** Version attribution override (defaults to the {@link Config} version). */
    version?: string | undefined
  }

  type ErrorType = BaseError & { name: 'BaseError' }
}
