import { getVersion } from './utils.js'

type BaseErrorParameters = {
  cause?: BaseError | Error | undefined
  details?: string | undefined
  docsBaseUrl?: string | undefined
  docsPath?: string | undefined
  docsSlug?: string | undefined
  metaMessages?: string[] | undefined
}

export type BaseErrorType = BaseError & { name: 'ViemError' }
export class BaseError extends Error {
  details: string
  docsPath?: string | undefined
  metaMessages?: string[] | undefined
  shortMessage: string
  version: string

  override name = 'ViemError'

  constructor(shortMessage: string, args: BaseErrorParameters = {}) {
    const details =
      args.cause instanceof BaseError
        ? args.cause.details
        : args.cause?.message
          ? args.cause.message
          : args.details!
    const docsPath =
      args.cause instanceof BaseError
        ? args.cause.docsPath || args.docsPath
        : args.docsPath
    const version = getVersion()

    const message = [
      shortMessage || 'An error occurred.',
      '',
      ...(args.metaMessages ? [...args.metaMessages, ''] : []),
      ...(docsPath
        ? [
            `Docs: ${args.docsBaseUrl ?? 'https://viem.sh'}${docsPath}${
              args.docsSlug ? `#${args.docsSlug}` : ''
            }`,
          ]
        : []),
      ...(details ? [`Details: ${details}`] : []),
      `Version: ${version}`,
    ].join('\n')

    super(message, args.cause ? { cause: args.cause } : undefined)

    this.details = details
    this.docsPath = docsPath
    this.metaMessages = args.metaMessages
    this.shortMessage = shortMessage
    this.version = version
  }

  walk(): Error
  walk(fn: (err: unknown) => boolean): Error | null
  walk(fn?: any): any {
    return walk(this, fn)
  }
}

function walk(
  err: unknown,
  fn?: ((err: unknown) => boolean) | undefined,
): unknown {
  if (fn?.(err)) return err
  if (err && typeof err === 'object' && 'cause' in err)
    return walk(err.cause, fn)
  return fn ? null : err
}
