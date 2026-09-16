import { expect, test } from 'vitest'
import { configureGenesis } from './prool.tmp.js'

const genesis = {
  config: {
    chainId: 1337,
    osakaTime: 0,
    t0Time: 0,
    t1Time: 0,
    t1aTime: 0,
    t9Time: 100,
    t10Time: 200,
    t11Time: 0,
    t12Time: 0,
    t13Time: 0,
  },
  alloc: {
    '0x5af2000000000000000000000000000000000000': { code: '0xef' },
    '0x5A4D000000000000000000000000000000000000': { code: '0x1234' },
    '0x5ad1000000000000000000000000000000000000': { code: '0x1234' },
    '0x5A56000000000000000000000000000000000000': { code: '0x1234' },
    '0x0000000000000000000000000000000000000001': { balance: '0x1' },
  },
}

test('T10 activates at genesis without later forks', () => {
  const result = configureGenesis(structuredClone(genesis), 'T10')
  expect(result.alloc).toEqual(genesis.alloc)
  expect(result.config).toMatchInlineSnapshot(`
    {
      "chainId": 1337,
      "osakaTime": 0,
      "t0Time": 0,
      "t10Time": 0,
      "t1Time": 0,
      "t1aTime": 0,
      "t9Time": 0,
    }
  `)
})

test('T9 disables all later forks', () => {
  expect(configureGenesis(structuredClone(genesis), 'T9').alloc).toEqual({
    '0x0000000000000000000000000000000000000001': { balance: '0x1' },
  })
  expect(
    configureGenesis(structuredClone(genesis), 'T9').config,
  ).toMatchInlineSnapshot(`
      {
        "chainId": 1337,
        "osakaTime": 0,
        "t0Time": 0,
        "t1Time": 0,
        "t1aTime": 0,
        "t9Time": 0,
      }
    `)
})

test.each([undefined, 'Tnext'])('%s preserves the dev genesis', (hardfork) => {
  expect(configureGenesis(structuredClone(genesis), hardfork)).toEqual(genesis)
})

test('disables future numbered forks and target subforks', () => {
  const result = configureGenesis(
    {
      config: { ...genesis.config, t10aTime: 0, t99Time: 0 },
      alloc: {},
    },
    'T10',
  )
  expect(result.config).not.toHaveProperty('t10aTime')
  expect(result.config).not.toHaveProperty('t99Time')
})

test('rejects unsupported hardforks', () => {
  expect(() =>
    configureGenesis(structuredClone(genesis), 'T100'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Unsupported Tempo hardfork: T100]`,
  )
})

test('rejects an image without the requested fork', () => {
  expect(() =>
    configureGenesis({ config: { t9Time: 0 }, alloc: {} }, 'T10'),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Tempo genesis does not support T10]`,
  )
})
