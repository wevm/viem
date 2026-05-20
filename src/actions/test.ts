import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import type * as Mode from './test/internal/mode.js'
import { mine } from './test/mine.js'
import { revert } from './test/revert.js'
import { setBalance } from './test/setBalance.js'
import { setCode } from './test/setCode.js'
import { setNonce } from './test/setNonce.js'
import { setStorageAt } from './test/setStorageAt.js'
import { snapshot } from './test/snapshot.js'

/**
 * Creates a test action decorator.
 *
 * @param options - Options.
 * @returns Client decorator.
 */
export function testActions(options: testActions.Options = {}) {
  const { mode } = options
  return <chain extends Chain.Chain | undefined = Chain.Chain | undefined>(
    client: Client.Client<chain>,
  ) => ({
    test: {
      mine: (options: mine.Options) => mine(client, { mode, ...options }),
      revert: (options: revert.Options) => revert(client, options),
      setBalance: (options: setBalance.Options) =>
        setBalance(client, { mode, ...options }),
      setCode: (options: setCode.Options) =>
        setCode(client, { mode, ...options }),
      setNonce: (options: setNonce.Options) =>
        setNonce(client, { mode, ...options }),
      setStorageAt: (options: setStorageAt.Options) =>
        setStorageAt(client, { mode, ...options }),
      snapshot: () => snapshot(client),
    },
  })
}

export declare namespace testActions {
  type Options = Mode.Options
}

export { mine, revert, setBalance, setCode, setNonce, setStorageAt, snapshot }
