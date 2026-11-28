import { setCode, signAuthorization } from 'viem/actions'
import { expect, test } from 'vitest'
import { wagmiContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { custom } from '../../clients/transports/custom.js'
import { encodeFunctionData, parseEther, parseGwei } from '../../utils/index.js'
import { createAccessList } from './createAccessList.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const result = await createAccessList(client, {
    data: encodeFunctionData({
      abi: wagmiContractConfig.abi,
      functionName: 'name',
    }),
    to: wagmiContractConfig.address,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
          "storageKeys": [
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        },
      ],
      "gasUsed": 26671n,
    }
  `)
})

test('args: blockNumber', async () => {
  const result = await createAccessList(client, {
    blockNumber: 22263623n,
    data: encodeFunctionData({
      abi: wagmiContractConfig.abi,
      functionName: 'name',
    }),
    to: wagmiContractConfig.address,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
          "storageKeys": [
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        },
      ],
      "gasUsed": 26671n,
    }
  `)
})

test('args: authorizationList', async () => {
  // SLOAD(1)
  const delegate = '0x00000000000000000000000000000000000000de'
  await setCode(client, { address: delegate, bytecode: '0x60015400' })
  const eoa = privateKeyToAccount(accounts[1].privateKey)
  const authorization = await signAuthorization(client, {
    account: eoa,
    contractAddress: delegate,
  })

  const result = await createAccessList(client, {
    authorizationList: [authorization],
    to: eoa.address,
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "storageKeys": [
            "0x0000000000000000000000000000000000000000000000000000000000000001",
          ],
        },
      ],
      "gasUsed": 40323n,
    }
  `)
})

test('args: blobVersionedHashes', async () => {
  // SLOAD(BLOBHASH(0))
  const address = '0x00000000000000000000000000000000000000bb'
  await setCode(client, { address, bytecode: '0x5f495400' })
  const blobVersionedHash =
    '0x01aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

  const result = await createAccessList(client, {
    account: accounts[0].address,
    blobVersionedHashes: [blobVersionedHash],
    maxFeePerBlobGas: parseGwei('10'),
    to: address,
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0x00000000000000000000000000000000000000bb",
          "storageKeys": [
            "0x01aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          ],
        },
      ],
      "gasUsed": 25405n,
    }
  `)
})

test('behavior: revert', async () => {
  await expect(() =>
    createAccessList(client, {
      data: encodeFunctionData({
        abi: wagmiContractConfig.abi,
        functionName: 'safeTransferFrom',
        args: [accounts[0].address, accounts[1].address, parseEther('1')],
      }),
      to: wagmiContractConfig.address,
    }),
  ).rejects.toThrowError('Execution reverted')
})

test('behavior: response error', async () => {
  const client = createPublicClient({
    transport: custom({
      async request() {
        return {
          accessList: [],
          error: 'execution reverted: nope',
          gasUsed: '0x0',
        }
      },
    }),
  })

  await expect(() =>
    createAccessList(client, {
      to: wagmiContractConfig.address,
    }),
  ).rejects.toMatchInlineSnapshot(`
    [CallExecutionError: Execution reverted with reason: nope.

    Raw Call Arguments:
      to:  0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2

    Details: execution reverted: nope
    Version: viem@x.y.z]
  `)
})
