import { getVersion } from './utils.js'

type BaseErrorParameters = {
  docsPath?: string
  docsSlug?: string
  metaMessages?: string[]
} & (
  | {
      cause?: never
      details?: string
    }
  | {
      cause: BaseError | Error
      details?: never
    }
)

export type BaseErrorType = BaseError & { name: 'ViemError' }
export class BaseError extends Error {
  details: string
  docsPath?: string
  metaMessages?: string[]
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
            `Docs: https://viem.sh${docsPath}.html${
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

function walk(err: unknown, fn?: (err: unknown) => boolean): unknown {
  if (fn?.(err)) return err
  if (err && typeof err === 'object' && 'cause' in err)
    return walk(err.cause, fn)
  return fn ? null : err
}
