import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
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
 * @returns Client decorator.
 */
export function testActions() {
  return <chain extends Chain.Chain | undefined = Chain.Chain | undefined>(
    client: Client.Client<chain>,
  ) => ({
    test: {
      mine: (options: mine.Options) => mine(client, options),
      revert: (options: revert.Options) => revert(client, options),
      setBalance: (options: setBalance.Options) => setBalance(client, options),
      setCode: (options: setCode.Options) => setCode(client, options),
      setNonce: (options: setNonce.Options) => setNonce(client, options),
      setStorageAt: (options: setStorageAt.Options) =>
        setStorageAt(client, options),
      snapshot: () => snapshot(client),
    },
  })
}

export { mine, revert, setBalance, setCode, setNonce, setStorageAt, snapshot }
