// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from '../../package.json'

/* c8 ignore next */
const version = process.env.TEST ? '1.0.2' : pkg.version

type BaseErrorArgs = { docsPath?: string; humanMessage: string } & (
  | {
      cause?: never
      details: string
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

  constructor({ humanMessage, ...args }: BaseErrorArgs) {
    const details =
      args.cause instanceof BaseError
        ? args.cause.details
        : args.cause instanceof Error
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
      'Details: ' + details,
      ...(args.cause &&
      !(args.cause instanceof BaseError) &&
      Object.keys(args.cause).length > 0
        ? ['Internal Error: ' + JSON.stringify(args.cause)]
        : []),
      'Version: viem@' + version,
    ].join('\n')

    super(message)

    if (args.cause) this.cause = args.cause
    this.details = details
    this.docsPath = docsPath
    this.humanMessage = humanMessage
  }
}
