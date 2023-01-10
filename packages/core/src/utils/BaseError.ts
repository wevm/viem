// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from '../../package.json'

/* c8 ignore next */
const version = process.env.TEST ? '1.0.2' : pkg.version

type BaseErrorArgs = { docsPath?: string } & (
  | {
      cause?: never
      details?: string
    }
  | {
      cause: BaseError | Error
      details?: never
    }
)

export class BaseError extends Error {
  humanMessage: string
  details: string
  docsPath?: string

  name = 'ViemError'

  constructor(humanMessage: string, args: BaseErrorArgs = {}) {
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
    const message = [
      humanMessage,
      ...(docsPath ? ['', 'Docs: https://viem.sh' + docsPath] : []),
      '',
      ...(details ? ['Details: ' + details] : []),
      'Version: viem@' + version,
      ...(args.cause &&
      !(args.cause instanceof BaseError) &&
      Object.keys(args.cause).length > 0
        ? ['Internal Error: ' + JSON.stringify(args.cause)]
        : []),
    ].join('\n')

    super(message)

    if (args.cause) this.cause = args.cause
    this.details = details
    this.docsPath = docsPath
    this.humanMessage = humanMessage
  }
}
