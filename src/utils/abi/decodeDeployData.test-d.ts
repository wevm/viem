import { expectTypeOf, test } from 'vitest'

import { decodeDeployData } from './decodeDeployData.js'

test('default', async () => {
  const { args } = decodeDeployData({
    abi: [
      {
        inputs: [
          {
            type: 'uint256',
          },
          {
            type: 'string',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
    ],
    bytecode:
      '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
    data: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c634300080700330000000000000000000000000000000000000000000000000000000000010f2c',
  })
  expectTypeOf(args).toEqualTypeOf<readonly [bigint, string]>()
})

test('no params', async () => {
  const { args } = decodeDeployData({
    abi: [
      {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
    ],
    bytecode:
      '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
    data: '0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220116554d4ba29ee08da9e97dc54ff9a2a65d67a648140d616fc225a25ff08c86364736f6c63430008070033',
  })
  expectTypeOf(args).toEqualTypeOf<undefined>()
})
