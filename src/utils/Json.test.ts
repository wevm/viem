import { describe, expect, test } from 'vitest'

import * as Json from './Json.js'

describe('prettyPrint', () => {
  test('flat object: aligns entries', () => {
    expect(Json.prettyPrint({ from: '0xabc', gas: 21000n, nonce: 1 }))
      .toMatchInlineSnapshot(`
      "from:   0xabc
      gas:    21000
      nonce:  1"
    `)
  })

  test('drops undefined object entries', () => {
    expect(Json.prettyPrint({ from: '0xabc', to: undefined, gas: 21000n }))
      .toMatchInlineSnapshot(`
      "from:  0xabc
      gas:   21000"
    `)
  })

  test('renders null, false, zero, and empty string', () => {
    expect(Json.prettyPrint({ a: null, b: false, c: 0, d: '' }))
      .toMatchInlineSnapshot(`
      "a:  null
      b:  false
      c:  0
      d:  "
    `)
  })

  test('renders bigint via toString (does not throw)', () => {
    expect(
      Json.prettyPrint({ value: 1000000000000000000n }),
    ).toMatchInlineSnapshot(`"value:  1000000000000000000"`)
  })

  test('nested object', () => {
    expect(
      Json.prettyPrint({
        from: '0xabc',
        fees: { maxFeePerGas: 3n, maxPriorityFeePerGas: 1n },
      }),
    ).toMatchInlineSnapshot(`
      "from:  0xabc
      fees:
        maxFeePerGas:          3
        maxPriorityFeePerGas:  1"
    `)
  })

  test('array of scalars', () => {
    expect(Json.prettyPrint({ storageKeys: ['0x0', '0x1', '0x2'] }))
      .toMatchInlineSnapshot(`
      "storageKeys:
        - 0x0
        - 0x1
        - 0x2"
    `)
  })

  test('array of objects', () => {
    expect(
      Json.prettyPrint({
        accessList: [
          { address: '0x1111', storageKeys: ['0x0'] },
          { address: '0x2222', storageKeys: ['0x1', '0x2'] },
        ],
      }),
    ).toMatchInlineSnapshot(`
      "accessList:
        - address:      0x1111
          storageKeys:
            - 0x0
        - address:      0x2222
          storageKeys:
            - 0x1
            - 0x2"
    `)
  })

  test('nested arrays', () => {
    expect(
      Json.prettyPrint({
        matrix: [
          [1, 2],
          [3, 4],
        ],
      }),
    ).toMatchInlineSnapshot(`
      "matrix:
        -
          - 1
          - 2
        -
          - 3
          - 4"
    `)
  })

  test('empty object and empty array render inline', () => {
    expect(Json.prettyPrint({ a: {}, b: [], c: { d: {}, e: [] } }))
      .toMatchInlineSnapshot(`
      "a:  {}
      b:  []
      c:
        d:  {}
        e:  []"
    `)
  })

  test('top-level scalar', () => {
    expect(Json.prettyPrint('0xabc')).toMatchInlineSnapshot(`"0xabc"`)
    expect(Json.prettyPrint(42n)).toMatchInlineSnapshot(`"42"`)
    expect(Json.prettyPrint(null)).toMatchInlineSnapshot(`"null"`)
  })

  test('top-level array', () => {
    expect(Json.prettyPrint(['0x0', '0x1'])).toMatchInlineSnapshot(`
      "- 0x0
      - 0x1"
    `)
  })

  test('top-level undefined renders inline', () => {
    expect(Json.prettyPrint(undefined)).toMatchInlineSnapshot(`"undefined"`)
  })

  test('undefined array items render inline', () => {
    expect(Json.prettyPrint(['0x0', undefined, '0x1'])).toMatchInlineSnapshot(`
      "- 0x0
      - undefined
      - 0x1"
    `)
  })

  test('top-level empty object/array', () => {
    expect(Json.prettyPrint({})).toMatchInlineSnapshot(`"{}"`)
    expect(Json.prettyPrint([])).toMatchInlineSnapshot(`"[]"`)
  })

  test('array of arrays of objects', () => {
    expect(Json.prettyPrint([[{ a: 1 }], [{ b: 2 }, { c: 3 }]]))
      .toMatchInlineSnapshot(`
      "-
        - a:  1
      -
        - b:  2
        - c:  3"
    `)
  })

  test('deeply nested mixed structure', () => {
    expect(
      Json.prettyPrint({
        request: {
          to: '0x1111',
          accessList: [{ address: '0x2222', storageKeys: ['0x0', '0x1'] }],
        },
        block: 'latest',
      }),
    ).toMatchInlineSnapshot(`
      "request:
        to:          0x1111
        accessList:
          - address:      0x2222
            storageKeys:
              - 0x0
              - 0x1
      block:    latest"
    `)
  })

  test('indent option offsets the whole block', () => {
    expect(Json.prettyPrint({ from: '0xabc', gas: 21000n }, { indent: 2 }))
      .toMatchInlineSnapshot(`
      "  from:  0xabc
        gas:   21000"
    `)
  })

  test('circular object reference renders [Circular]', () => {
    const a: Record<string, unknown> = { name: 'a' }
    a.self = a
    expect(Json.prettyPrint(a as Json.prettyPrint.Value))
      .toMatchInlineSnapshot(`
      "name:  a
      self:  [Circular]"
    `)
  })

  test('circular array reference renders [Circular]', () => {
    const a: unknown[] = [1]
    a.push(a)
    expect(Json.prettyPrint(a as Json.prettyPrint.Value))
      .toMatchInlineSnapshot(`
      "- 1
      - [Circular]"
    `)
  })

  test('shared (non-circular) reference renders fully twice', () => {
    const shared = { x: 1 }
    expect(Json.prettyPrint({ a: shared, b: shared })).toMatchInlineSnapshot(`
      "a:
        x:  1
      b:
        x:  1"
    `)
  })

  test('object whose entries are all undefined renders empty', () => {
    expect(Json.prettyPrint({ a: undefined, b: undefined })).toBe('')
  })
})
