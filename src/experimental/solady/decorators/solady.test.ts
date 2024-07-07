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
    `"0x70f581c85c8d5f84d7e5ae496afda8789b87c42293f881c6f382dcba35b5b57f59e181f93b98d51e4454aa8a4f43113f957f68cdf66eac7e06f5eeef224a85601b"`,
  )

  const clientWithAccount = anvilMainnet
    .getClient({ account: true })
    .extend(soladyActions({ verifier }))
  const result_2 = await clientWithAccount.signMessage({
    message: 'Hello, world!',
  })
  expect(result_2).toMatchInlineSnapshot(
    `"0x70f581c85c8d5f84d7e5ae496afda8789b87c42293f881c6f382dcba35b5b57f59e181f93b98d51e4454aa8a4f43113f957f68cdf66eac7e06f5eeef224a85601b"`,
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
    `"0x6a3011fea94a44f91941b76abc4490ef6b27343cdb7588361af17efa0bbfc7b03f4e21b59a588f8d169fbd838003a1065162a623faca2b3ab4683c4750e883001b1788ede5301fb0c4b95dda42eabe811ba83dc3cde96087b00c9b72a4d26a379ac2972c4c4323c6d7ee73e319350f290c6549b6eb516b5e5354128413342332154d61696c2875696e743235362074696d657374616d702c506572736f6e2066726f6d2c506572736f6e20746f2c737472696e6720636f6e74656e74732c62797465732068617368294e616d6528737472696e672066697273742c737472696e67206c61737429506572736f6e284e616d65206e616d652c616464726573732077616c6c65742c737472696e675b335d206661766f72697465436f6c6f72732c75696e7432353620666f6f2c75696e7438206167652c626f6f6c206973436f6f6c2900c1"`,
  )

  const clientWithAccount = anvilMainnet
    .getClient({ account: true })
    .extend(soladyActions({ verifier }))
  const result_2 = await clientWithAccount.signTypedData({
    ...typedData.complex,
    primaryType: 'Mail',
  })
  expect(result_2).toMatchInlineSnapshot(
    `"0x6a3011fea94a44f91941b76abc4490ef6b27343cdb7588361af17efa0bbfc7b03f4e21b59a588f8d169fbd838003a1065162a623faca2b3ab4683c4750e883001b1788ede5301fb0c4b95dda42eabe811ba83dc3cde96087b00c9b72a4d26a379ac2972c4c4323c6d7ee73e319350f290c6549b6eb516b5e5354128413342332154d61696c2875696e743235362074696d657374616d702c506572736f6e2066726f6d2c506572736f6e20746f2c737472696e6720636f6e74656e74732c62797465732068617368294e616d6528737472696e672066697273742c737472696e67206c61737429506572736f6e284e616d65206e616d652c616464726573732077616c6c65742c737472696e675b335d206661766f72697465436f6c6f72732c75696e7432353620666f6f2c75696e7438206167652c626f6f6c206973436f6f6c2900c1"`,
  )
})
