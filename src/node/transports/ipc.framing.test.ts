import { expect, test } from 'vitest'

import { createMessageExtractor } from './ipc.js'

function extract(...buffers: Buffer[]) {
  const messages: unknown[] = []
  const onData = createMessageExtractor((message) =>
    messages.push(JSON.parse(message.toString())),
  )
  for (const buffer of buffers) onData(buffer)
  return messages
}

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

  expect(extract(buffer)).toEqual([response, next])
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

  for (let split = 0; split <= buffer.length; split++)
    expect(extract(buffer.subarray(0, split), buffer.subarray(split))).toEqual(
      responses,
    )

  const bytes = Array.from({ length: buffer.length }, (_, offset) =>
    buffer.subarray(offset, offset + 1),
  )
  expect(extract(...bytes)).toEqual(responses)
})

test('retains only the incomplete message following a complete response', () => {
  const response = { jsonrpc: '2.0', id: 1, result: 'unmatched { in a string' }
  const incomplete = '{"jsonrpc":"2.0","id":2,"result":"escaped \\'
  const messages: string[] = []
  const onData = createMessageExtractor((message) =>
    messages.push(message.toString()),
  )

  onData(Buffer.from(`${JSON.stringify(response)}\n${incomplete}`))

  expect(messages).toEqual([JSON.stringify(response)])

  onData(Buffer.from('"" }'))

  expect(messages).toEqual([JSON.stringify(response), `${incomplete}"" }`])
})
