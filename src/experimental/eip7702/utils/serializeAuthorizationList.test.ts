import { expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../../test/src/abis.js'
import { serializeAuthorizationList } from './serializeAuthorizationList.js'

test('default', () => {
  expect(serializeAuthorizationList()).toMatchInlineSnapshot('[]')
  expect(serializeAuthorizationList([])).toMatchInlineSnapshot('[]')

  expect(
    serializeAuthorizationList([
      {
        contractAddress: wagmiContractConfig.address,
        chainId: 1,
        nonce: 69,
        r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        yParity: 1,
      },
    ]),
  ).toMatchInlineSnapshot(`
    [
      [
        "0x1",
        "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
        "0x45",
        "0x1",
        "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
      ],
    ]
  `)

  expect(
    serializeAuthorizationList([
      {
        contractAddress: '0x0000000000000000000000000000000000000000',
        chainId: 0,
        nonce: 0,
        r: '0x00',
        s: '0x00',
        yParity: 0,
      },
    ]),
  ).toMatchInlineSnapshot(`
    [
      [
        "0x",
        "0x0000000000000000000000000000000000000000",
        "0x",
        "0x",
        "0x",
        "0x",
      ],
    ]
  `)

  expect(
    serializeAuthorizationList([
      {
        contractAddress: wagmiContractConfig.address,
        chainId: 1,
        nonce: 69,
        r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        yParity: 1,
      },
      {
        contractAddress: wagmiContractConfig.address,
        chainId: 69,
        nonce: 420,
        r: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        s: '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        yParity: 0,
      },
    ]),
  ).toMatchInlineSnapshot(`
    [
      [
        "0x1",
        "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
        "0x45",
        "0x1",
        "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
      ],
      [
        "0x45",
        "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
        "0x1a4",
        "0x",
        "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
        "0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe",
      ],
    ]
  `)
})
