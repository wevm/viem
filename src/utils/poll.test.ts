import { expect, test } from 'vitest'

import { poll } from './poll.js'
import { wait } from './wait.js'

test('polls on a given interval', async () => {
  let items: string[] = []
  poll(
    async () => {
      items.push('wagmi')
    },
    {
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

test('emitOnBegin', async () => {
  let items: string[] = []
  poll(
    async () => {
      items.push('wagmi')
    },
    {
      emitOnBegin: true,
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
      items.push('wagmi')
    },
    {
      initialWaitTime: async () => 200,
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
  const unpoll = poll(
    async () => {
      items.push('wagmi')
    },
    {
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

  unpoll()

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

test('stop polling via callback', async () => {
  let items: string[] = []
  poll(
    async ({ unpoll }) => {
      items.push('wagmi')
      if (items.length === 2) unpoll()
    },
    {
      interval: 100,
    },
  )

  await wait(500)
  expect(items).toMatchInlineSnapshot(`
    [
      "wagmi",
      "wagmi",
    ]
  `)
})
