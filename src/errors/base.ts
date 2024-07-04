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

  override name = 'ViemError'
  version = getVersion()

  constructor(shortMessage: string, args: BaseErrorParameters = {}) {
    super()

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

    this.message = [
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
      `Version: ${this.version}`,
    ].join('\n')

    if (args.cause) this.cause = args.cause
    this.details = details
    this.docsPath = docsPath
    this.metaMessages = args.metaMessages
    this.shortMessage = shortMessage
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
