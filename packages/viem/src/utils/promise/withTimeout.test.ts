import { expect, test } from 'vitest'

import { createServer } from 'http'
import { AddressInfo } from 'net'

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
  const server = createServer((req, res) => {
    setTimeout(() => res.end('wagmi'), 5000)
  })

  await expect(
    () =>
      new Promise((resolve, reject) => {
        server.listen(async () => {
          const { port } = <AddressInfo>server.address()

          ;(async () => {
            try {
              resolve(
                await withTimeout(
                  async ({ signal }) => {
                    await fetch(`http://localhost:${port}`, { signal })
                  },
                  {
                    errorInstance: new Error('timed out'),
                    timeout: 500,
                    signal: true,
                  },
                ),
              )
            } catch (err) {
              reject(err)
            }
          })()
        })
      }),
  ).rejects.toThrowError('timed out')
})
