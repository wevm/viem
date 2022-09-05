import { expect, test } from 'vitest'

import { poll } from './poll'
import { wait } from './wait'

test('polls on a given interval', async () => {
  let items: string[] = []
  poll(
    async () => {
      return 'wagmi'
    },
    {
      onData: (data) => items.push(data),
      interval: 100,
    },
  )

  await wait(500)
  expect(items).toMatchInlineSnapshot(`
    [
      "wagmi",
      "wagmi",
      "wagmi",
      "wagmi",
    ]
  `)
})

test('emitOnOpen', async () => {
  let items: string[] = []
  poll(
    async () => {
      return 'wagmi'
    },
    {
      emitOnOpen: true,
      onData: (data) => items.push(data),
      interval: 100,
    },
  )

  await wait(500)
  expect(items).toMatchInlineSnapshot(`
    [
      "wagmi",
      "wagmi",
      "wagmi",
      "wagmi",
      "wagmi",
    ]
  `)
})

test('initialWaitTime', async () => {
  let items: string[] = []
  poll(
    async () => {
      return 'wagmi'
    },
    {
      initialWaitTime: async () => 200,
      onData: (data) => items.push(data),
      interval: 100,
    },
  )

  await wait(500)
  expect(items).toMatchInlineSnapshot(`
    [
      "wagmi",
      "wagmi",
      "wagmi",
    ]
  `)
})

test('stop polling', async () => {
  let items: string[] = []
  const stop = poll(
    async () => {
      return 'wagmi'
    },
    {
      onData: (data) => items.push(data),
      interval: 100,
    },
  )

  await wait(500)
  expect(items).toMatchInlineSnapshot(`
    [
      "wagmi",
      "wagmi",
      "wagmi",
      "wagmi",
    ]
  `)

  stop()

  await wait(500)
  expect(items).toMatchInlineSnapshot(`
    [
      "wagmi",
      "wagmi",
      "wagmi",
      "wagmi",
    ]
  `)
})
