import * as ox_BaseError from 'ox/Errors'
import { version } from './version.js'

type ErrorConfig = {
  getDocsUrl?: ((args: BaseErrorParameters) => string | undefined) | undefined
  version?: string | undefined
}

let errorConfig: ErrorConfig = {
  getDocsUrl: ({
    docsBaseUrl,
    docsPath = '',
    docsSlug,
  }: BaseErrorParameters) =>
    docsPath
      ? `${docsBaseUrl ?? 'https://viem.sh'}${docsPath}${
          docsSlug ? `#${docsSlug}` : ''
        }`
      : undefined,
  version: `viem@${version}`,
}

export function setErrorConfig(config: ErrorConfig) {
  errorConfig = config
}

type BaseErrorParameters = {
  cause?: BaseError | Error | undefined
  details?: string | undefined
  docsBaseUrl?: string | undefined
  docsPath?: string | undefined
  docsSlug?: string | undefined
  metaMessages?: string[] | undefined
  name?: string | undefined
}

export type BaseErrorType = BaseError & { name: 'BaseError' }
export class BaseError extends ox_BaseError.BaseError<Error> {
  metaMessages?: string[] | undefined

  constructor(shortMessage: string, args: BaseErrorParameters = {}) {
    const {
      cause,
      details,
      docsBaseUrl,
      docsPath,
      docsSlug,
      metaMessages,
      name,
    } = args

    const docsUrl = errorConfig.getDocsUrl?.({
      docsBaseUrl,
      docsPath,
      docsSlug,
      name,
    })
    const url = docsUrl ? new URL(docsUrl, docsBaseUrl) : undefined

    super(shortMessage, {
      cause,
      details,
      docsPath: url?.pathname,
      docsOrigin: url?.origin,
      metaMessages,
      version: errorConfig.version,
    })

    this.metaMessages = metaMessages
    this.name = name ?? this.name
  }
}
