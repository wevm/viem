import { expect, test } from 'vitest'

import { createHttpServer } from '~test/utils.js'

import { withRetry } from './withRetry.js'

test('default', async () => {
  let retryTimes = -1
  const server = await createHttpServer((_req, res) => {
    retryTimes++
    res.writeHead(500)
    res.end()
  })

  await expect(
    withRetry(async () => {
      const response = await fetch(server.url)
      if (response.status === 500) throw new Error('test')
      return response
    }),
  ).rejects.toThrowError('test')
  expect(retryTimes).toBe(2)
})

test('shouldRetry: retries, and then errors', async () => {
  let retryTimes = -1
  const server = await createHttpServer((_req, res) => {
    retryTimes++
    res.writeHead(500)
    res.end()
  })

  await expect(
    withRetry(
      async () => {
        const response = await fetch(server.url)
        if (response.status === 500) throw new Error('test')
        return response
      },
      { shouldRetry: ({ error }) => error.message === 'test' },
    ),
  ).rejects.toThrowError('test')
  expect(retryTimes).toBe(2)
})

test('shouldRetry: retries, and then succeeds', async () => {
  let retryTimes = -1
  const server = await createHttpServer((_req, res) => {
    retryTimes++
    if (retryTimes === 2) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify({ message: 'success' }))
    } else {
      res.writeHead(500)
      res.end()
    }
  })

  const res = await withRetry(
    async () => {
      const response = await fetch(server.url)
      if (response.status === 500) throw new Error('test')
      return (await response).json()
    },
    {
      retryCount: 3,
      shouldRetry: ({ error }) => error.message === 'test',
    },
  )
  expect(res).toEqual({ message: 'success' })
  expect(retryTimes).toBe(2)
})

test('retryCount', async () => {
  let retryTimes = -1
  const server = await createHttpServer((_req, res) => {
    retryTimes++
    res.writeHead(500)
    res.end()
  })

  await expect(
    withRetry(
      async () => {
        const response = await fetch(server.url)
        if (response.status === 500) throw new Error('test')
        return response
      },
      { retryCount: 1 },
    ),
  ).rejects.toThrowError('test')
  expect(retryTimes).toBe(1)
})

test('delay: number', async () => {
  const start = Date.now()
  let end = 0
  const server = await createHttpServer((_req, res) => {
    end = Date.now() - start
    res.writeHead(500)
    res.end()
  })

  await expect(
    withRetry(
      async () => {
        const response = await fetch(server.url)
        if (response.status === 500) throw new Error('test')
        return response
      },
      { retryCount: 1, delay: 500 },
    ),
  ).rejects.toThrowError('test')
  expect(end > 500 && end < 520).toBe(true)
})

test('delay: fn', async () => {
  const start = Date.now()
  let end = 0
  const server = await createHttpServer((_req, res) => {
    end = Date.now() - start
    res.writeHead(500, {
      'Retry-After': 1,
    })
    res.end()
  })

  await expect(
    withRetry(
      async () => {
        const response = await fetch(server.url)
        class TestError extends Error {
          headers: Headers
          constructor(headers: Headers) {
            super('test')
            this.headers = headers
          }
        }
        if (response.status === 500) throw new TestError(response.headers)
        return response
      },
      {
        retryCount: 1,
        delay: ({ error }) => {
          const retryAfter = (error as any).headers.get('Retry-After')
          if (retryAfter?.match(/\d/))
            return Number.parseInt(retryAfter, 10) * 1000
          return 100
        },
      },
    ),
  ).rejects.toThrowError('test')
  expect(end > 1000 && end < 1020).toBe(true)
})

test('signal: already aborted', async () => {
  let retryTimes = 0
  const controller = new AbortController()
  controller.abort()

  await expect(
    withRetry(
      async () => {
        retryTimes++
        throw new Error('test')
      },
      { signal: controller.signal },
    ),
  ).rejects.toThrow('This operation was aborted')
  expect(retryTimes).toBe(0)
})

test('signal: aborted during retries', async () => {
  let retryTimes = 0
  const controller = new AbortController()

  await expect(
    withRetry(
      async () => {
        retryTimes++
        if (retryTimes === 1) controller.abort()
        throw new Error('test')
      },
      { signal: controller.signal, delay: 0 },
    ),
  ).rejects.toThrow('This operation was aborted')
  expect(retryTimes).toBe(1)
})

test('signal: not aborted', async () => {
  let retryTimes = 0
  const controller = new AbortController()

  const result = await withRetry(
    async () => {
      retryTimes++
      if (retryTimes < 2) throw new Error('test')
      return 'success'
    },
    { signal: controller.signal, delay: 0 },
  )

  expect(result).toBe('success')
  expect(retryTimes).toBe(2)
})

test('signal: aborted with custom reason', async () => {
  const controller = new AbortController()
  const customError = new Error('Custom abort reason')
  controller.abort(customError)

  await expect(
    withRetry(
      async () => {
        throw new Error('test')
      },
      { signal: controller.signal },
    ),
  ).rejects.toThrow('Custom abort reason')
})
