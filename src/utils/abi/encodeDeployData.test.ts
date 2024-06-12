import { expect, test } from 'vitest'

import { encodeDeployData } from './encodeDeployData.js'

test('constructor()', () => {
  expect(
    encodeDeployData({
      abi: [
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
      ],
      bytecode:
        '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
    }),
  ).toEqual(
    '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
  )
  expect(
    encodeDeployData({
      abi: [
        {
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
      ],
      bytecode:
        '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
    }),
  ).toEqual(
    '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
  )
})

test('constructor(uint256)', () => {
  expect(
    encodeDeployData({
      abi: [
        {
          inputs: [
            {
              name: 'a',
              type: 'uint256',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
      ],
      bytecode:
        '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
      args: [69420n],
    }),
  ).toEqual(
    '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c634300080700330000000000000000000000000000000000000000000000000000000000010f2c',
  )
})

test('error: constructor not found', () => {
  expect(() =>
    encodeDeployData({
      abi: [{}],
      bytecode:
        '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
      args: [69420n],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiConstructorNotFoundError: A constructor was not found on the ABI.
    Make sure you are using the correct ABI and that the constructor exists on it.

    Docs: https://viem.sh/docs/contract/encodeDeployData
    Version: viem@x.y.z]
  `)
})

test('error: no inputs', () => {
  expect(() =>
    encodeDeployData({
      abi: [
        {
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
      ],
      bytecode:
        '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
      args: [69420n],
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [AbiConstructorParamsNotFoundError: Constructor arguments were provided (\`args\`), but a constructor parameters (\`inputs\`) were not found on the ABI.
    Make sure you are using the correct ABI, and that the \`inputs\` attribute on the constructor exists.

    Docs: https://viem.sh/docs/contract/encodeDeployData
    Version: viem@x.y.z]
  `,
  )

  expect(() =>
    encodeDeployData({
      abi: [
        {
          inputs: undefined,
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
      ],
      bytecode:
        '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
      args: [69420n],
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [AbiConstructorParamsNotFoundError: Constructor arguments were provided (\`args\`), but a constructor parameters (\`inputs\`) were not found on the ABI.
    Make sure you are using the correct ABI, and that the \`inputs\` attribute on the constructor exists.

    Docs: https://viem.sh/docs/contract/encodeDeployData
    Version: viem@x.y.z]
  `,
  )
})
