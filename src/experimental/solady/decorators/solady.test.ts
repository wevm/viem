import type { Address } from 'abitype'
import { beforeAll, expect, test } from 'vitest'

import { Mock4337AccountFactory } from '../../../../test/contracts/generated.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts, typedData } from '../../../../test/src/constants.js'
import { deployMock4337Account } from '../../../../test/src/utils.js'
import {
  mine,
  simulateContract,
  writeContract,
} from '../../../actions/index.js'
import { pad } from '../../../utils/index.js'
import { soladyActions } from './solady.js'

const client = anvilMainnet.getClient().extend(soladyActions())

let verifier: Address
beforeAll(async () => {
  const { factoryAddress } = await deployMock4337Account()
  const { result, request } = await simulateContract(client, {
    account: accounts[0].address,
    abi: Mock4337AccountFactory.abi,
    address: factoryAddress,
    functionName: 'createAccount',
    args: [accounts[0].address, pad('0x0')],
  })
  verifier = result
  await writeContract(client, request)
  await mine(client, { blocks: 1 })
})

test('default', () => {
  expect(soladyActions()(client)).toMatchInlineSnapshot(`
    {
      "signMessage": [Function],
      "signTypedData": [Function],
    }
  `)
})

test('signMessage', async () => {
  const result = await client.signMessage({
    account: accounts[0].address,
    message: 'Hello, world!',
    verifier,
  })
  expect(result).toMatchInlineSnapshot(
    `"0x2fd7a8fe17e1e364f3527263a1e0963f2bf1c1e12c0889347f7633351cb7d8060a1a87099c3ed804bd31405705946dc9266744574b1153f2905948a6967d67a11b"`,
  )

  const clientWithAccount = anvilMainnet
    .getClient({ account: true })
    .extend(soladyActions({ verifier }))
  const result_2 = await clientWithAccount.signMessage({
    message: 'Hello, world!',
  })
  expect(result_2).toMatchInlineSnapshot(
    `"0x2fd7a8fe17e1e364f3527263a1e0963f2bf1c1e12c0889347f7633351cb7d8060a1a87099c3ed804bd31405705946dc9266744574b1153f2905948a6967d67a11b"`,
  )
})

test('signTypedData', async () => {
  const result = await client.signTypedData({
    ...typedData.complex,
    account: accounts[0].address,
    primaryType: 'Mail',
    verifier,
  })
  expect(result).toMatchInlineSnapshot(
    `"0x17f7e62a3921a11100b1f9631ed17c176767719fcc6e6178bf05e44fe0def85274e45a4f27940e9bc53f55d8c6934524d461f031059ba41bc0991e52093e53a71c1788ede5301fb0c4b95dda42eabe811ba83dc3cde96087b00c9b72a4d26a379ac2972c4c4323c6d7ee73e319350f290c6549b6eb516b5e5354128413342332154d61696c2875696e743235362074696d657374616d702c506572736f6e2066726f6d2c506572736f6e20746f2c737472696e6720636f6e74656e74732c62797465732068617368294e616d6528737472696e672066697273742c737472696e67206c61737429506572736f6e284e616d65206e616d652c616464726573732077616c6c65742c737472696e675b335d206661766f72697465436f6c6f72732c75696e7432353620666f6f2c75696e7438206167652c626f6f6c206973436f6f6c2900c1"`,
  )

  const clientWithAccount = anvilMainnet
    .getClient({ account: true })
    .extend(soladyActions({ verifier }))
  const result_2 = await clientWithAccount.signTypedData({
    ...typedData.complex,
    primaryType: 'Mail',
  })
  expect(result_2).toMatchInlineSnapshot(
    `"0x17f7e62a3921a11100b1f9631ed17c176767719fcc6e6178bf05e44fe0def85274e45a4f27940e9bc53f55d8c6934524d461f031059ba41bc0991e52093e53a71c1788ede5301fb0c4b95dda42eabe811ba83dc3cde96087b00c9b72a4d26a379ac2972c4c4323c6d7ee73e319350f290c6549b6eb516b5e5354128413342332154d61696c2875696e743235362074696d657374616d702c506572736f6e2066726f6d2c506572736f6e20746f2c737472696e6720636f6e74656e74732c62797465732068617368294e616d6528737472696e672066697273742c737472696e67206c61737429506572736f6e284e616d65206e616d652c616464726573732077616c6c65742c737472696e675b335d206661766f72697465436f6c6f72732c75696e7432353620666f6f2c75696e7438206167652c626f6f6c206973436f6f6c2900c1"`,
  )
})
