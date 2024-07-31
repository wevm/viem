import type { Address } from 'abitype'
import { beforeAll, expect, test } from 'vitest'

import { SoladyAccountFactory07 } from '~contracts/generated.js'
import { anvilMainnet } from '~test/src/anvil.js'
import { accounts, typedData } from '~test/src/constants.js'
import { deploySoladyAccount_07 } from '../../../../test/src/utils.js'
import {
  mine,
  simulateContract,
  verifyMessage,
  verifyTypedData,
  writeContract,
} from '../../../actions/index.js'
import { pad } from '../../../utils/index.js'
import { soladyActions } from './solady.js'

const client = anvilMainnet.getClient().extend(soladyActions())

let verifier: Address
beforeAll(async () => {
  const { factoryAddress } = await deploySoladyAccount_07()
  const { result, request } = await simulateContract(client, {
    account: accounts[0].address,
    abi: SoladyAccountFactory07.abi,
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
  const signature = await client.signMessage({
    account: accounts[0].address,
    message: 'Hello, world!',
    verifier,
  })
  expect(
    await verifyMessage(client!, {
      address: verifier,
      message: 'Hello, world!',
      signature,
    }),
  ).toBeTruthy()

  const clientWithAccount = anvilMainnet
    .getClient({ account: true })
    .extend(soladyActions({ verifier }))
  const result_2 = await clientWithAccount.signMessage({
    message: 'Hello, world!',
  })
  expect(
    await verifyMessage(client!, {
      address: verifier,
      message: 'Hello, world!',
      signature: result_2,
    }),
  ).toBeTruthy()
})

test('signTypedData', async () => {
  const result = await client.signTypedData({
    ...typedData.complex,
    account: accounts[0].address,
    primaryType: 'Mail',
    verifier,
  })
  expect(
    await verifyTypedData(client, {
      ...typedData.complex,
      address: verifier,
      signature: result,
      primaryType: 'Mail',
    }),
  ).toBeTruthy()

  const clientWithAccount = anvilMainnet
    .getClient({ account: true })
    .extend(soladyActions({ verifier }))
  const result_2 = await clientWithAccount.signTypedData({
    ...typedData.complex,
    primaryType: 'Mail',
  })
  expect(
    await verifyTypedData(client, {
      ...typedData.complex,
      address: verifier,
      signature: result_2,
      primaryType: 'Mail',
    }),
  ).toBeTruthy()
})
