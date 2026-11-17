import { expect, test } from 'vitest'

import { createAsyncIterator } from './asyncIterator.js'

function createSource() {
  const source = new EventTarget()
  const iterator = () =>
    createAsyncIterator<{ number: number }>((onData, onError, end) => {
      const data = (event: Event) =>
        onData((event as CustomEvent<{ number: number }>).detail)
      const error = (event: Event) =>
        onError((event as CustomEvent<Error>).detail)
      source.addEventListener('data', data)
      source.addEventListener('error', error)
      source.addEventListener('end', end)
      return () => {
        source.removeEventListener('data', data)
        source.removeEventListener('error', error)
        source.removeEventListener('end', end)
      }
    })
  return {
    data: (number: number) =>
      source.dispatchEvent(new CustomEvent('data', { detail: { number } })),
    error: () =>
      source.dispatchEvent(
        new CustomEvent('error', { detail: new Error('source failed') }),
      ),
    end: () => source.dispatchEvent(new Event('end')),
    iterator,
  }
}

test('resolves a pending read with an incoming value', async () => {
  const source = createSource()
  const iterator = source.iterator()
  const next = iterator.next()

  source.data(1)

  expect(await next).toMatchInlineSnapshot(`
    {
      "done": false,
      "value": {
        "number": 1,
      },
    }
  `)
  await iterator.return?.()
})

test('keeps only the latest buffered value', async () => {
  const source = createSource()
  const iterator = source.iterator()

  source.data(1)
  source.data(2)

  expect(await iterator.next()).toMatchInlineSnapshot(`
    {
      "done": false,
      "value": {
        "number": 2,
      },
    }
  `)
  await iterator.return?.()
})

test('rejects a pending read and completes after an error', async () => {
  const source = createSource()
  const iterator = source.iterator()
  const next = iterator.next()

  source.error()

  await expect(next).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: source failed]`,
  )
  expect(await iterator.next()).toMatchInlineSnapshot(`
    {
      "done": true,
      "value": undefined,
    }
  `)
})

test('delivers the buffered value before a buffered error', async () => {
  const source = createSource()
  const iterator = source.iterator()

  source.data(1)
  source.error()

  expect(await iterator.next()).toMatchInlineSnapshot(`
    {
      "done": false,
      "value": {
        "number": 1,
      },
    }
  `)
  await expect(iterator.next()).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: source failed]`,
  )
  expect(await iterator.next()).toMatchInlineSnapshot(`
    {
      "done": true,
      "value": undefined,
    }
  `)
})

test('source completion resolves a pending read', async () => {
  const source = createSource()
  const iterator = source.iterator()
  const next = iterator.next()

  source.end()

  expect(await next).toMatchInlineSnapshot(`
    {
      "done": true,
      "value": undefined,
    }
  `)
})

test('return unregisters only that iterator', async () => {
  const source = createSource()
  const first = source.iterator()
  const second = source.iterator()
  const next = first.next()

  await first.return?.()
  source.data(2)

  expect(await next).toMatchInlineSnapshot(`
    {
      "done": true,
      "value": undefined,
    }
  `)
  expect(await first.next()).toMatchInlineSnapshot(`
    {
      "done": true,
      "value": undefined,
    }
  `)
  expect(await second.next()).toMatchInlineSnapshot(`
    {
      "done": false,
      "value": {
        "number": 2,
      },
    }
  `)
  await second.return?.()
})

test('is its own async iterator and stops on a for-await break', async () => {
  const source = createSource()
  const iterator = source.iterator()

  source.data(1)

  expect(iterator[Symbol.asyncIterator]()).toBe(iterator)
  for await (const value of iterator) {
    expect(value).toMatchInlineSnapshot(`
      {
        "number": 1,
      }
    `)
    break
  }
  source.data(2)
  expect(await iterator.next()).toMatchInlineSnapshot(`
    {
      "done": true,
      "value": undefined,
    }
  `)
})
