// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from '../../package.json'

/* c8 ignore next */
const version = process.env.TEST ? '1.0.2' : pkg.version

type BaseErrorArgs = { docsLink?: string; humanMessage: string } & (
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
  docsLink?: string

  name = 'ViemError'

  constructor({ humanMessage, ...args }: BaseErrorArgs) {
    const details =
      args.cause instanceof BaseError
        ? args.cause.details
        : args.cause instanceof Error
        ? args.cause.message
        : args.details!
    const docsLink =
      args.cause instanceof BaseError ? args.cause.docsLink : args.docsLink
    const message = [
      humanMessage,
      ...(docsLink ? ['', 'Docs: ' + docsLink] : []),
      '',
      'Details: ' + details,
      'Version: viem@' + version,
    ].join('\n')

    super(message)

    if (args.cause) this.cause = args.cause
    this.details = details
    this.docsLink = docsLink
    this.humanMessage = humanMessage
  }
}
