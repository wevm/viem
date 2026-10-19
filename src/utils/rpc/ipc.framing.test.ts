import { expect, test } from 'vitest'

import { extractMessages } from './ipc.js'

test.each([
  'execution reverted: {',
  'execution reverted: }',
  'execution reverted: {\u0013dI',
  'braces { inside } a string',
  'escaped quote " followed by {',
  'escaped quote " followed by }',
  'backslash \\ followed by {',
  'backslash \\ followed by }',
  'backslash then quote \\" followed by {',
  'trailing backslash \\',
  'two trailing backslashes \\\\',
  'unicode 原因 {',
])('ignores braces inside JSON strings: %s', (message) => {
  const response = {
    jsonrpc: '2.0',
    id: 1,
    result: [{ calls: [{ error: { code: 3, message } }] }],
  }
  const next = { jsonrpc: '2.0', id: 2, result: '0x1' }
  const buffer = Buffer.from(
    `${JSON.stringify(response)}${JSON.stringify(next)}`,
  )

  const [messages, remaining] = extractMessages(buffer)

  expect(messages.map((value) => JSON.parse(value.toString()))).toEqual([
    response,
    next,
  ])
  expect(remaining.length).toBe(0)
})

test('handles every byte boundary across escaped strings and messages', () => {
  const responses = [
    {
      jsonrpc: '2.0',
      id: 1,
      result: {
        message: 'execution reverted: {\u0013dI " \\" } 原因 \\\\',
        nested: [{ message: 'trailing backslash \\' }],
      },
    },
    { jsonrpc: '2.0', id: 2, result: '0x1' },
    {
      jsonrpc: '2.0',
      method: 'eth_subscription',
      params: { subscription: '0x1', result: { message: '}' } },
    },
  ]
  const buffer = Buffer.from(
    ` \n${responses.map((response) => JSON.stringify(response)).join('\n')}\n`,
  )

  for (let split = 0; split <= buffer.length; split++) {
    const [first, remainder] = extractMessages(buffer.subarray(0, split))
    const [second, remaining] = extractMessages(
      Buffer.concat([remainder, buffer.subarray(split)]),
    )

    expect(
      [...first, ...second].map((message) => JSON.parse(message.toString())),
    ).toEqual(responses)
    expect(remaining.length).toBe(0)
  }

  const messages: Buffer[] = []
  let remaining = Buffer.alloc(0) as Buffer
  for (let offset = 0; offset < buffer.length; offset++) {
    const [complete, remainder] = extractMessages(
      Buffer.concat([remaining, buffer.subarray(offset, offset + 1)]),
    )
    messages.push(...complete)
    remaining = remainder
  }
  expect(messages.map((message) => JSON.parse(message.toString()))).toEqual(
    responses,
  )
  expect(remaining.length).toBe(0)
})

test('retains only the incomplete message following a complete response', () => {
  const response = { jsonrpc: '2.0', id: 1, result: 'unmatched { in a string' }
  const incomplete = '{"jsonrpc":"2.0","id":2,"result":"escaped \\'
  const [messages, remaining] = extractMessages(
    Buffer.from(`${JSON.stringify(response)}\n${incomplete}`),
  )

  expect(messages.map((message) => JSON.parse(message.toString()))).toEqual([
    response,
  ])
  expect(remaining.toString()).toBe(incomplete)
})
