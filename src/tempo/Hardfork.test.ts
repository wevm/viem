import { Hardfork } from 'viem/tempo'
import { expect, test } from 'vitest'

test('lt', () => {
  expect(Hardfork.lt('t2', 't3')).toMatchInlineSnapshot(`true`)
  expect(Hardfork.lt('t3', 't3')).toMatchInlineSnapshot(`false`)
  expect(Hardfork.lt('t14', 't3')).toMatchInlineSnapshot(`false`)
})

test('behavior: unknown hardfork is newer than known hardforks', () => {
  expect(Hardfork.lt('t99', 't14')).toMatchInlineSnapshot(`false`)
})
