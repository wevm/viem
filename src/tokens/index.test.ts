import { expect, test } from 'vitest'
import * as tokens from './index.js'

test('exports', () => {
  expect(Object.keys(tokens)).toMatchInlineSnapshot(`
    [
      "Addresses",
      "Actions",
      "Decorators",
      "usdc",
      "TokenNotFoundError",
    ]
  `)
})

test('Actions.erc20', () => {
  expect(typeof tokens.Actions.erc20.transfer).toBe('function')
  expect(typeof tokens.Actions.erc20.getBalance).toBe('function')
})

test('Decorators', () => {
  expect(typeof tokens.Decorators.defineErc20).toBe('function')
  expect(typeof tokens.Decorators.getAddress).toBe('function')
})

test('usdc', () => {
  expect(typeof tokens.usdc).toBe('function')
  // decorator factory → decorator → client extension
  expect(typeof tokens.usdc()).toBe('function')
})
