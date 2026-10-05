import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { wait } from '../../../core/internal/wait.js'
import { getTimeToFinalize } from './getTimeToFinalize.js'

/** Waits until an OP Stack withdrawal can be finalized. */
export async function waitToFinalize<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: waitToFinalize.Options,
): Promise<waitToFinalize.ReturnType> {
  const { seconds } = await getTimeToFinalize(client, options)
  await wait(seconds * 1000)
}

export declare namespace waitToFinalize {
  /** Options for {@link waitToFinalize}. */
  type Options = getTimeToFinalize.Options

  /** Return type of {@link waitToFinalize}. */
  type ReturnType = void

  /** Errors thrown by {@link waitToFinalize}. */
  type ErrorType = getTimeToFinalize.ErrorType | Errors.GlobalErrorType
}
