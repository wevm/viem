import { getVersion } from './internal/errors.js'

export type GlobalErrorType<name extends string = 'Error'> = Error & {
  name: name
}

/**
 * Base error class inherited by all errors thrown by ox.
 *
 * @example
 * ```ts
 * import { Errors } from 'ox'
 * throw new Errors.BaseError('An error occurred')
 * ```
 */
export class BaseError<
  cause extends Error | undefined = undefined,
> extends Error {
  details: string
  docs?: string | undefined
  docsPath?: string | undefined
  shortMessage: string

  override cause: cause
  override name = 'BaseError'

  constructor(shortMessage: string, options: BaseError.Options<cause> = {}) {
    const details = (() => {
      if (options.cause instanceof BaseError) {
        if (options.cause.details) return options.cause.details
        if (options.cause.shortMessage) return options.cause.shortMessage
      }
      if (options.cause?.message) return options.cause.message
      return options.details!
    })()
    const docsPath = (() => {
      if (options.cause instanceof BaseError)
        return options.cause.docsPath || options.docsPath
      return options.docsPath
    })()

    const docsBaseUrl = 'https://viem.sh'
    const docs = `${docsBaseUrl}${docsPath ?? ''}`

    const message = [
      shortMessage || 'An error occurred.',
      ...(options.metaMessages ? ['', ...options.metaMessages] : []),
      ...(details || docsPath
        ? [
            '',
            details ? `Details: ${details}` : undefined,
            docsPath ? `See: ${docs}` : undefined,
            `Version: viem@${getVersion()}`,
          ]
        : []),
    ]
      .filter((x) => typeof x === 'string')
      .join('\n')

    super(message, options.cause ? { cause: options.cause } : undefined)

    this.cause = options.cause as any
    this.details = details
    this.docs = docs
    this.docsPath = docsPath
    this.shortMessage = shortMessage
  }

  walk(): Error
  walk(fn: (err: unknown) => boolean): Error | null
  walk(fn?: any): any {
    return walk(this, fn)
  }
}

export declare namespace BaseError {
  type Options<cause extends Error | undefined = Error | undefined> = {
    cause?: cause | undefined
    details?: string | undefined
    docsPath?: string | undefined
    metaMessages?: (string | undefined)[] | undefined
  }
}

/** @internal */
function walk(
  err: unknown,
  fn?: ((err: unknown) => boolean) | undefined,
): unknown {
  if (fn?.(err)) return err
  if (err && typeof err === 'object' && 'cause' in err && err.cause)
    return walk(err.cause, fn)
  return fn ? null : err
}
