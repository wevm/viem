import { parseAbiItem } from 'viem'
import { expect, test } from 'vitest'

import { encodeEventFilterTopics } from './encodeEventFilterTopics.js'

const transfer = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)
const approval = parseAbiItem(
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
)

test('default', () => {
  expect(encodeEventFilterTopics({})).toMatchInlineSnapshot(`[]`)
})

test('args: event', () => {
  expect(encodeEventFilterTopics({ event: transfer })).toMatchInlineSnapshot(`
    [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    ]
  `)
})

test('args: event + args', () => {
  expect(
    encodeEventFilterTopics({
      args: { to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC' },
      event: transfer,
    }),
  ).toMatchInlineSnapshot(`
    [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      null,
      "0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac",
    ]
  `)
})

test('args: events', () => {
  expect(
    encodeEventFilterTopics({ events: [transfer, approval] }),
  ).toMatchInlineSnapshot(`
    [
      [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
      ],
    ]
  `)
})

test('args: event + events', () => {
  expect(
    encodeEventFilterTopics({ event: transfer, events: [transfer, approval] }),
  ).toMatchInlineSnapshot(`
    [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
    ]
  `)
})
