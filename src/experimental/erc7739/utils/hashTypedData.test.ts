import type { Address } from 'abitype'
import { beforeAll, expect, test } from 'vitest'

import { SoladyAccountFactory07 } from '~contracts/generated.js'
import { anvilMainnet } from '~test/src/anvil.js'
import { accounts, typedData } from '~test/src/constants.js'
import { deploySoladyAccount_07 } from '~test/src/utils.js'
import { serializeSignature, sign } from '../../../accounts/index.js'
import {
  getEip712Domain,
  mine,
  simulateContract,
  verifyTypedData,
  writeContract,
} from '../../../actions/index.js'
import { pad } from '../../../utils/index.js'
import { hashTypedData } from './hashTypedData.js'
import { wrapTypedDataSignature } from './wrapTypedDataSignature.js'

const client = anvilMainnet.getClient()

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

test('default', async () => {
  const {
    domain: verifierDomain,
    extensions,
    fields,
  } = await getEip712Domain(client, {
    address: verifier,
  })

  const hash = hashTypedData({
    ...typedData.complex,
    extensions,
    fields,
    verifierDomain,
    primaryType: 'Mail',
  })

  expect(hash).toBeDefined()

  const signature = await sign({
    hash,
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyTypedData(client!, {
      ...typedData.complex,
      address: verifier,
      primaryType: 'Mail',
      signature: wrapTypedDataSignature({
        ...typedData.complex,
        primaryType: 'Mail',
        signature: serializeSignature(signature),
      }),
    }),
  ).toBeTruthy()
})
