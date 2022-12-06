import { expect, test } from 'vitest'

import { createHttpServer } from '../../../test'
import { withRetry } from './withRetry'

test('shouldRetryOnResponse: retries, and then errors', async () => {
  let retryTimes = -1

  const server = await createHttpServer((req, res) => {
    res.writeHead(500)
    res.end()
  })

  const res = await withRetry(
    async () => {
      retryTimes++
      const response = await fetch(server.url)
      return response
    },
    {
      retryCount: 3,
      shouldRetryOnResponse: ({ data }) => data?.status === 500,
    },
  )

  expect(res).toBeDefined()
  expect(retryTimes).toBe(3)

  server.close()
})

test('shouldRetryOnResponse: retries, and then succeeds', async () => {
  let retryTimes = -1

  const server = await createHttpServer((req, res) => {
    if (retryTimes === 2) {
      res.writeHead(200)
    } else {
      res.writeHead(500)
    }
    res.end()
  })

  const res = await withRetry(
    async () => {
      retryTimes++
      const response = await fetch(server.url)
      return response
    },
    {
      retryCount: 3,
      shouldRetryOnResponse: ({ data }) => data?.status === 500,
    },
  )

  expect(res).toBeDefined()
  expect(retryTimes).toBe(2)

  server.close()
})

test('shouldRetryOnResponse (async): retries, and then errors', async () => {
  let retryTimes = -1

  const server = await createHttpServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'wagmi' }))
  })

  const res = await withRetry(
    async () => {
      retryTimes++
      const response = await fetch(server.url)
      return response
    },
    {
      retryCount: 3,
      shouldRetryOnResponse: async ({ data }) => (await data.json()).error,
    },
  )

  expect(await res.json()).toMatchInlineSnapshot(`
    {
      "error": "wagmi",
    }
  `)
  expect(retryTimes).toBe(3)

  server.close()
})

test('shouldRetryOnResponse (async): retries, and then succeeds', async () => {
  let retryTimes = -1

  const server = await createHttpServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    if (retryTimes === 2) {
      res.end(JSON.stringify({ message: 'wagmi' }))
    } else {
      res.end(JSON.stringify({ error: 'wagmi' }))
    }
  })

  const res = await withRetry(
    async () => {
      retryTimes++
      const response = await fetch(server.url)
      return response
    },
    {
      retryCount: 3,
      shouldRetryOnResponse: async ({ data }) => (await data.json()).error,
    },
  )

  expect(res).toBeDefined()
  expect(retryTimes).toBe(2)

  server.close()
})

test('shouldRetryOnError: retries, and then errors', async () => {
  let retryTimes = -1
  await expect(
    withRetry(
      async () => {
        retryTimes++
        throw new Error('test')
      },
      { shouldRetryOnError: ({ error }) => error.message === 'test' },
    ),
  ).rejects.toThrowError('test')
  expect(retryTimes).toBe(2)
})

test('shouldRetryOnError: retries, and then succeeds', async () => {
  let retryTimes = -1
  const res = await withRetry(
    async () => {
      retryTimes++
      if (retryTimes === 2) return 'success'
      throw new Error('test')
    },
    {
      retryCount: 3,
      shouldRetryOnError: ({ error }) => error.message === 'test',
    },
  )
  expect(res).toBe('success')
  expect(retryTimes).toBe(2)
})

test.skip('delay: custom delay', async () => {
  let timestamps: Date[] = []

  const server = await createHttpServer((req, res) => {
    res.writeHead(500)
    res.end()
  })

  await withRetry(
    async () => {
      timestamps.push(new Date())
      const response = await fetch(server.url)
      return response
    },
    {
      delay: 1000,
      retryCount: 3,
      shouldRetryOnResponse: ({ data }) => data?.status === 500,
    },
  )

  expect(
    Math.floor((timestamps[1].getTime() - timestamps[0].getTime()) / 1000) *
      1000,
  ).toBe(1000)
  expect(
    Math.floor((timestamps[2].getTime() - timestamps[1].getTime()) / 1000) *
      1000,
  ).toBe(1000)
  expect(
    Math.floor((timestamps[3].getTime() - timestamps[2].getTime()) / 1000) *
      1000,
  ).toBe(1000)

  server.close()
})

test.skip('delay: custom delay fn', async () => {
  let timestamps: Date[] = []

  const server = await createHttpServer((req, res) => {
    res.writeHead(500, {
      'Retry-After': 1,
    })
    res.end()
  })

  await withRetry(
    async () => {
      timestamps.push(new Date())
      const response = await fetch(server.url)
      return response
    },
    {
      delay: ({ data }) => {
        const retryAfter = data?.headers.get('Retry-After')
        if (retryAfter?.match(/\d/)) return parseInt(retryAfter) * 1000
        return 100
      },
      retryCount: 3,
      shouldRetryOnResponse: ({ data }) => data?.status === 500,
    },
  )

  expect(
    Math.floor((timestamps[1].getTime() - timestamps[0].getTime()) / 1000) *
      1000,
  ).toBe(1000)
  expect(
    Math.floor((timestamps[2].getTime() - timestamps[1].getTime()) / 1000) *
      1000,
  ).toBe(1000)
  expect(
    Math.floor((timestamps[3].getTime() - timestamps[2].getTime()) / 1000) *
      1000,
  ).toBe(1000)

  server.close()
})
