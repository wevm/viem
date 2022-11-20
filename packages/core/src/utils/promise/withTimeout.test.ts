import { expect, test } from 'vitest'

import { createHttpServer } from '../../../../test/src/utils'
import { wait } from '../wait'
import { withTimeout } from './withTimeout'

test('times out correctly', async () => {
  await expect(() =>
    withTimeout(
      async () => {
        await wait(2000)
      },
      { errorInstance: new Error('timed out'), timeout: 500 },
    ),
  ).rejects.toThrowError('timed out')
})

test('times out correctly w/ signal', async () => {
  const server = await createHttpServer((req, res) =>
    setTimeout(() => res.end('wagmi'), 5000),
  )

  await expect(() =>
    withTimeout(
      async ({ signal }) => {
        await fetch(server.url, { signal })
      },
      {
        errorInstance: new Error('timed out'),
        timeout: 500,
        signal: true,
      },
    ),
  ).rejects.toThrowError('timed out')

  server.close()
})
