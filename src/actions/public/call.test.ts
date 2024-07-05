import { describe, expect, test, vi } from 'vitest'

import {
  Mock4337Account,
  Mock4337AccountFactory,
  OffchainLookupExample,
} from '~contracts/generated.js'
import {
  baycContractConfig,
  usdcContractConfig,
  wagmiContractConfig,
} from '~test/src/abis.js'
import { createCcipServer } from '~test/src/ccip.js'
import { accounts } from '~test/src/constants.js'
import { blobData, kzg } from '~test/src/kzg.js'
import {
  deployMock4337Account_07,
  deployOffchainLookupExample,
  mainnetClient,
} from '~test/src/utils.js'

import { aggregate3Signature } from '../../constants/contract.js'
import { BaseError } from '../../errors/base.js'
import { RawContractError } from '../../errors/contract.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'
import { trim } from '../../utils/data/trim.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { wait } from '../../utils/wait.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import {
  http,
  type Hex,
  createClient,
  decodeFunctionResult,
  encodeAbiParameters,
  multicall3Abi,
  pad,
  parseEther,
  stringToHex,
  toBlobs,
  toHex,
} from '../../index.js'
import { call, getRevertErrorData } from './call.js'
import { readContract } from './readContract.js'

const client = anvilMainnet.getClient({ account: accounts[0].address })

const wagmiContractAddress = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
const name4bytes = '0x06fdde03'
const mint4bytes = '0x1249c58b'
const mintWithParams4bytes = '0xa0712d68'
const fourTwenty =
  '00000000000000000000000000000000000000000000000000000000000001a4'
const sixHundred =
  '0000000000000000000000000000000000000000000000000000000000aaaaaa'

const sourceAccount = accounts[0]

test('default', async () => {
  const { data } = await call(client, {
    data: name4bytes,
    account: sourceAccount.address,
    to: wagmiContractAddress,
  })
  expect(data).toMatchInlineSnapshot(
    '"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000"',
  )
})

describe('ccip', () => {
  test('default', async () => {
    const server = await createCcipServer()
    const { contractAddress } = await deployOffchainLookupExample({
      urls: [`${server.url}/{sender}/{data}`],
    })

    const calldata = encodeFunctionData({
      abi: OffchainLookupExample.abi,
      functionName: 'getAddress',
      args: ['jxom.viem'],
    })

    const { data } = await call(client, {
      data: calldata,
      to: contractAddress!,
    })

    expect(trim(data!)).toEqual(accounts[0].address)

    await server.close()
  })

  test('ccip disabled', async () => {
    const server = await createCcipServer()
    const { contractAddress } = await deployOffchainLookupExample({
      urls: [`${server.url}/{sender}/{data}`],
    })

    const calldata = encodeFunctionData({
      abi: OffchainLookupExample.abi,
      functionName: 'getAddress',
      args: ['jxom.viem'],
    })

    const client = createClient({
      ccipRead: false,
      transport: http(anvilMainnet.rpcUrl.http),
    })

    await expect(() =>
      call(client, {
        data: calldata,
        to: contractAddress!,
      }),
    ).rejects.toThrowError(
      'Execution reverted with reason: custom error 556f1830',
    )

    await server.close()
  })

  test('error: invalid signature', async () => {
    const server = await createCcipServer()
    const { contractAddress } = await deployOffchainLookupExample({
      urls: [`${server.url}/{sender}/{data}`],
    })

    const calldata = encodeFunctionData({
      abi: OffchainLookupExample.abi,
      functionName: 'getAddress',
      args: ['fake.viem'],
    })

    await expect(() =>
      call(client, {
        data: calldata,
        to: contractAddress!,
      }),
    ).rejects.toThrowError()

    await server.close()
  })
})

test('zero data', async () => {
  const { data } = await call(client, {
    data: mint4bytes,
    account: sourceAccount.address,
    to: wagmiContractAddress,
  })
  expect(data).toMatchInlineSnapshot('undefined')
})

test.skip('args: blockNumber', async () => {
  const { data } = await call(client, {
    blockNumber: 15564164n,
    data: `${mintWithParams4bytes}${fourTwenty}`,
    account: sourceAccount.address,
    to: wagmiContractAddress,
  })
  expect(data).toMatchInlineSnapshot('undefined')
})

test('args: override', async () => {
  const fakeName = 'NotWagmi'

  // layout of strings in storage
  const nameSlot = toHex(0, { size: 32 })
  const fakeNameHex = toHex(fakeName)
  // we don't divide by 2 because length must be length * 2 if word is strictly less than 32 bytes
  const bytesLen = fakeNameHex.length - 2

  expect(bytesLen).toBeLessThanOrEqual(62)

  const slotValue = `${pad(fakeNameHex, { dir: 'right', size: 31 })}${toHex(
    bytesLen,
    { size: 1 },
  ).slice(2)}` as Hex

  const { data } = await call(client, {
    data: name4bytes,
    to: wagmiContractAddress,
    stateOverride: [
      {
        address: wagmiContractAddress,
        stateDiff: [
          {
            slot: nameSlot,
            value: slotValue,
          },
        ],
      },
    ],
  })

  expect(data).toMatchInlineSnapshot(
    `"${encodeAbiParameters([{ type: 'string' }], [fakeName])}"`,
  )
})

test.skip('args: blobs', async () => {
  // TODO: migrate to `client` once 4844 is supported in Anvil.
  const blobs = toBlobs({ data: stringToHex(blobData) })
  const { data } = await call(client, {
    account: sourceAccount.address,
    blobs,
    kzg,
    maxFeePerBlobGas: parseGwei('20'),
    to: wagmiContractAddress,
  })
  expect(data).toMatchInlineSnapshot('undefined')
})

describe('account hoisting', () => {
  test.skip('no account hoisted', async () => {
    await expect(
      call(client, {
        data: `${mintWithParams4bytes}${sixHundred}`,
        to: wagmiContractAddress,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Execution reverted with reason: ERC721: mint to the zero address.

      Raw Call Arguments:
        to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:  0xa0712d680000000000000000000000000000000000000000000000000000000000000258

      Details: execution reverted: ERC721: mint to the zero address
      Version: viem@x.y.z"
    `)
  })

  test('account hoisted', async () => {
    const { data } = await call(client, {
      data: `${mintWithParams4bytes}${sixHundred}`,
      to: wagmiContractAddress,
    })
    expect(data).toMatchInlineSnapshot('undefined')
  })
})

describe('errors', () => {
  test('fee cap too high', async () => {
    await expect(() =>
      call(client, {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        account: sourceAccount.address,
        to: wagmiContractAddress,
        maxFeePerGas: 2n ** 256n - 1n + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [CallExecutionError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Raw Call Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:          0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei

      Version: viem@x.y.z]
    `)
  })

  // TODO:  Waiting for Anvil fix – should fail with "gas too low" reason
  //        This test will fail when Anvil is fixed.
  test('gas too low', async () => {
    await expect(() =>
      call(client, {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        account: sourceAccount.address,
        to: wagmiContractAddress,
        gas: 100n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [CallExecutionError: The amount of gas (100) provided for the transaction exceeds the limit allowed for the block.

      Raw Call Arguments:
        from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:  0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4
        gas:   100

      Details: intrinsic gas too high -- CallGasCostMoreThanGasLimit
      Version: viem@x.y.z]
    `)

    await expect(() =>
      call(mainnetClient, {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        account: sourceAccount.address,
        to: wagmiContractAddress,
        gas: 100n,
      }),
    ).rejects.toThrowError('intrinsic gas too low')
  })

  // TODO:  Waiting for Anvil fix – should fail with "gas too high" reason
  //        This test will fail when Anvil is fixed.
  test('gas too high', async () => {
    expect(
      await call(client, {
        account: sourceAccount.address,
        to: accounts[0].address,
        value: 1n,
        gas: 100_000_000_000_000_000n,
      }),
    ).toBeDefined()
  })

  // TODO:  Waiting for Anvil fix – should fail with "gas fee less than block base fee" reason
  //        This test will fail when Anvil is fixed.
  test('gas fee is less than block base fee', async () => {
    expect(
      await call(client, {
        account: sourceAccount.address,
        to: accounts[0].address,
        value: 1n,
        maxFeePerGas: 1n,
      }),
    ).toBeDefined()

    await expect(() =>
      call(mainnetClient, {
        account: sourceAccount.address,
        to: accounts[0].address,
        value: 1n,
        maxFeePerGas: 1n,
      }),
    ).rejects.toThrowError('cannot be lower than the block base fee')
  })

  test('nonce too low', async () => {
    await expect(() =>
      call(client, {
        account: sourceAccount.address,
        to: accounts[0].address,
        value: 1n,
        nonce: 0,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [CallExecutionError: Nonce provided for the transaction is lower than the current nonce of the account.
      Try increasing the nonce or find the latest nonce with \`getTransactionCount\`.

      Raw Call Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        value:  0.000000000000000001 ETH
        nonce:  0

      Details: nonce too low
      Version: viem@x.y.z]
    `)
  })

  test('insufficient funds', async () => {
    await expect(() =>
      call(client, {
        account: sourceAccount.address,
        to: accounts[0].address,
        value: parseEther('100000'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [CallExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

      This error could arise when the account does not have enough funds to:
       - pay for the total gas fee,
       - pay for the value to send.
       
      The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
       - \`gas\` is the amount of gas needed for transaction to execute,
       - \`gas fee\` is the gas fee,
       - \`value\` is the amount of ether to send to the recipient.
       
      Raw Call Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        value:  100000 ETH

      Details: Insufficient funds for gas * price + value
      Version: viem@x.y.z]
    `)

    await expect(() =>
      call(mainnetClient, {
        account: sourceAccount.address,
        to: accounts[0].address,
        value: parseEther('100000'),
      }),
    ).rejects.toThrowError('insufficient funds for gas * price + value')
  })

  test('maxFeePerGas less than maxPriorityFeePerGas', async () => {
    await expect(
      call(client, {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        account: sourceAccount.address,
        to: wagmiContractAddress,
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('22'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [CallExecutionError: The provided tip (\`maxPriorityFeePerGas\` = 22 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 20 gwei).

      Raw Call Arguments:
        from:                  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:                    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:                  0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4
        maxFeePerGas:          20 gwei
        maxPriorityFeePerGas:  22 gwei

      Version: viem@x.y.z]
    `)
  })

  test('contract revert (contract error)', async () => {
    await expect(
      call(client, {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        account: sourceAccount.address,
        to: wagmiContractAddress,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [CallExecutionError: Execution reverted with reason: revert: Token ID is taken.

      Raw Call Arguments:
        from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:  0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4

      Details: execution reverted: revert: Token ID is taken
      Version: viem@x.y.z]
    `,
    )
  })

  test('contract revert (insufficient params)', async () => {
    await expect(
      call(client, {
        data: mintWithParams4bytes,
        account: sourceAccount.address,
        to: wagmiContractAddress,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [CallExecutionError: Execution reverted for an unknown reason.

      Raw Call Arguments:
        from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:  0xa0712d68

      Details: execution reverted
      Version: viem@x.y.z]
    `)
  })

  describe('state overrides error', () => {
    test('wrong address', async () => {
      await expect(
        call(client, {
          data: name4bytes,
          to: wagmiContractAddress,
          stateOverride: [
            {
              address: '0x1',
              stateDiff: [
                {
                  slot: `0x${fourTwenty}`,
                  value: `0x${fourTwenty}`,
                },
              ],
            },
          ],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [CallExecutionError: Address "0x1" is invalid.

        - Address must be a hex value of 20 bytes (40 hex characters).
        - Address must match its checksum counterpart.
         
        Raw Call Arguments:
          from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
          to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
          data:  0x06fdde03
          State Override:
            0x1:
              stateDiff:
                0x00000000000000000000000000000000000000000000000000000000000001a4: 0x00000000000000000000000000000000000000000000000000000000000001a4

        Version: viem@x.y.z]
      `)
    })

    test('duplicate address', async () => {
      await expect(
        call(client, {
          data: name4bytes,
          to: wagmiContractAddress,
          stateOverride: [
            {
              address: wagmiContractAddress,
              stateDiff: [
                {
                  slot: `0x${fourTwenty}`,
                  value: `0x${fourTwenty}`,
                },
              ],
            },
            {
              address: wagmiContractAddress,
              stateDiff: [
                {
                  slot: `0x${fourTwenty}`,
                  value: `0x${fourTwenty}`,
                },
              ],
            },
          ],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [CallExecutionError: State for account "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2" is set multiple times.

        Raw Call Arguments:
          from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
          to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
          data:  0x06fdde03
          State Override:
            0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2:
              stateDiff:
                0x00000000000000000000000000000000000000000000000000000000000001a4: 0x00000000000000000000000000000000000000000000000000000000000001a4
            0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2:
              stateDiff:
                0x00000000000000000000000000000000000000000000000000000000000001a4: 0x00000000000000000000000000000000000000000000000000000000000001a4

        Version: viem@x.y.z]
      `)
    })

    test('pass state and stateDiff', async () => {
      await expect(
        call(client, {
          data: name4bytes,
          to: wagmiContractAddress,
          stateOverride: [
            // @ts-expect-error Cannot pass `state` and `stateDiff` at the same time
            {
              address: wagmiContractAddress,
              stateDiff: [
                {
                  slot: `0x${fourTwenty}`,
                  value: `0x${fourTwenty}`,
                },
              ],
              state: [
                {
                  slot: `0x${fourTwenty}`,
                  value: `0x${fourTwenty}`,
                },
              ],
            },
          ],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [CallExecutionError: state and stateDiff are set on the same account.

        Raw Call Arguments:
          from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
          to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
          data:  0x06fdde03
          State Override:
            0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2:
              state:
                0x00000000000000000000000000000000000000000000000000000000000001a4: 0x00000000000000000000000000000000000000000000000000000000000001a4
              stateDiff:
                0x00000000000000000000000000000000000000000000000000000000000001a4: 0x00000000000000000000000000000000000000000000000000000000000001a4

        Version: viem@x.y.z]
      `)
    })
  })

  test('pass code and factory', async () => {
    await expect(
      call(client, {
        code: wagmiContractConfig.bytecode,
        factory: wagmiContractConfig.address,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ViemError: Cannot provide both \`code\` & \`factory\`/\`factoryData\` as parameters.

      Version: viem@x.y.z]
    `)
  })

  test('pass code and to', async () => {
    await expect(
      call(client, {
        code: wagmiContractConfig.bytecode,
        to: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ViemError: Cannot provide both \`code\` & \`to\` as parameters.

      Version: viem@x.y.z]
    `)
  })
})

describe('batch call', () => {
  test('default', async () => {
    const client_2 = anvilMainnet.getClient({ batch: { multicall: true } })

    const spy = vi.spyOn(client_2, 'request')

    const p = []
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: usdcContractConfig.address,
      }),
    )
    await wait(1)
    p.push(
      call(client_2, {
        data: name4bytes,
        to: baycContractConfig.address,
      }),
    )
    await wait(1)
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
      }),
    )
    await wait(50)
    p.push(
      call(client_2, {
        data: name4bytes,
        to: usdcContractConfig.address,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: baycContractConfig.address,
      }),
    )

    const results = await Promise.all(p)

    expect(spy).toBeCalledTimes(4)
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f7265644170655961636874436c7562000000000000000000000000000000",
        },
        {
          "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f7265644170655961636874436c7562000000000000000000000000000000",
        },
      ]
    `)
  })

  test('args: blockNumber', async () => {
    const client_2 = anvilMainnet.getClient({ batch: { multicall: true } })

    const spy = vi.spyOn(client_2, 'request')

    const p = []
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
        blockNumber: anvilMainnet.forkBlockNumber,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
        blockNumber: anvilMainnet.forkBlockNumber + 1n,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: usdcContractConfig.address,
      }),
    )
    await wait(1)
    p.push(
      call(client_2, {
        data: name4bytes,
        to: baycContractConfig.address,
        blockNumber: anvilMainnet.forkBlockNumber,
      }),
    )
    await wait(1)
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
      }),
    )
    await wait(50)
    p.push(
      call(client_2, {
        data: name4bytes,
        to: usdcContractConfig.address,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: baycContractConfig.address,
      }),
    )

    const results = await Promise.all(p)

    expect(spy).toBeCalledTimes(6)
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f7265644170655961636874436c7562000000000000000000000000000000",
        },
        {
          "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f7265644170655961636874436c7562000000000000000000000000000000",
        },
      ]
    `)
  })

  test('args: no address, no data, aggregate3 sig, other properties', async () => {
    const client_2 = anvilMainnet.getClient({ batch: { multicall: true } })

    const spy = vi.spyOn(client_2, 'request')

    const p = []
    p.push(
      call(client_2, {
        data: name4bytes,
      }),
    )
    p.push(
      call(client_2, {
        to: wagmiContractAddress,
      }),
    )
    p.push(
      call(client_2, {
        data: aggregate3Signature,
        to: wagmiContractAddress,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
        maxFeePerGas: 1n,
      }),
    )

    try {
      await Promise.all(p)
    } catch {}

    expect(spy).toBeCalledTimes(4)
  })

  test('contract revert', async () => {
    const client_2 = anvilMainnet.getClient({ batch: { multicall: true } })

    const spy = vi.spyOn(client_2, 'request')

    const p = []
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
      }),
    )
    p.push(
      call(client_2, {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        to: wagmiContractAddress,
      }),
    )

    const results = await Promise.allSettled(p)

    expect(spy).toBeCalledTimes(1)
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "status": "fulfilled",
          "value": {
            "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
          },
        },
        {
          "reason": [CallExecutionError: Execution reverted for an unknown reason.

      Raw Call Arguments:
        to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:  0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4

      Version: viem@x.y.z],
          "status": "rejected",
        },
      ]
    `)
  })

  test('client config', async () => {
    const client_2 = anvilMainnet.getClient({
      batch: {
        multicall: {
          batchSize: 1024,
          wait: 16,
        },
      },
    })

    const spy = vi.spyOn(client_2, 'request')

    const p = []
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: usdcContractConfig.address,
      }),
    )
    await wait(1)
    p.push(
      call(client_2, {
        data: name4bytes,
        to: baycContractConfig.address,
      }),
    )
    await wait(1)
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
      }),
    )
    await wait(50)
    p.push(
      call(client_2, {
        data: name4bytes,
        to: usdcContractConfig.address,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: baycContractConfig.address,
      }),
    )

    const results = await Promise.all(p)

    expect(spy).toBeCalledTimes(2)
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f7265644170655961636874436c7562000000000000000000000000000000",
        },
        {
          "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f7265644170655961636874436c7562000000000000000000000000000000",
        },
      ]
    `)
  })

  test('no chain on client', async () => {
    const client_2 = anvilMainnet.getClient({
      batch: {
        multicall: true,
      },
      chain: false,
    })

    const spy = vi.spyOn(client_2, 'request')

    const p = []
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: usdcContractConfig.address,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: baycContractConfig.address,
      }),
    )

    const results = await Promise.all(p)

    expect(spy).toBeCalledTimes(3)
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f7265644170655961636874436c7562000000000000000000000000000000",
        },
      ]
    `)
  })

  test('chain not configured with multicall', async () => {
    const client_2 = anvilMainnet.getClient({
      batch: {
        multicall: true,
      },
    })
    client_2.chain = {
      ...client_2.chain,
      contracts: {
        // @ts-expect-error
        multicall3: undefined,
      },
    }

    const spy = vi.spyOn(client_2, 'request')

    const p = []
    p.push(
      call(client_2, {
        data: name4bytes,
        to: wagmiContractAddress,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: usdcContractConfig.address,
      }),
    )
    p.push(
      call(client_2, {
        data: name4bytes,
        to: baycContractConfig.address,
      }),
    )

    const results = await Promise.all(p)

    expect(spy).toBeCalledTimes(3)
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000",
        },
        {
          "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f7265644170655961636874436c7562000000000000000000000000000000",
        },
      ]
    `)
  })
})

describe('deployless call (factory)', () => {
  test('default', async () => {
    const { factoryAddress } = await deployMock4337Account_07()

    const address = await readContract(client, {
      account: accounts[0].address,
      abi: Mock4337AccountFactory.abi,
      address: factoryAddress,
      functionName: 'getAddress',
      args: [pad('0x0')],
    })
    const data = encodeFunctionData({
      abi: Mock4337Account.abi,
      functionName: 'eip712Domain',
    })
    const factoryData = encodeFunctionData({
      abi: Mock4337AccountFactory.abi,
      functionName: 'createAccount',
      args: [accounts[0].address, pad('0x0')],
    })

    const result = await call(client, {
      data,
      factory: factoryAddress,
      factoryData,
      to: address,
    })

    const [
      fields,
      name,
      version,
      chainId,
      verifyingContract,
      salt,
      extensions,
    ] = decodeFunctionResult({
      abi: Mock4337Account.abi,
      data: result.data!,
      functionName: 'eip712Domain',
    })

    expect(verifyingContract).toBeDefined()
    expect([
      fields,
      name,
      version,
      chainId,
      salt,
      extensions,
    ]).toMatchInlineSnapshot(`
      [
        "0x0f",
        "Mock4337Account",
        "1",
        1n,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        [],
      ]
    `)
  })

  test('error: failed counterfactual deployment', async () => {
    await expect(() =>
      call(client, {
        data: '0x',
        factory: '0x0000000000000000000000000000000000000000',
        factoryData: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [CounterfactualDeploymentFailedError: Deployment for counterfactual contract call failed for factory "0x0000000000000000000000000000000000000000".

      Please ensure:
      - The \`factory\` is a valid contract deployment factory (ie. Create2 Factory, ERC-4337 Factory, etc).
      - The \`factoryData\` is a valid encoded function call for contract deployment function on the factory.

      Version: viem@x.y.z]
    `)
  })
})

describe('deployless call (bytecode)', () => {
  test('default', async () => {
    const { data } = await call(client, {
      code: wagmiContractConfig.bytecode,
      data: encodeFunctionData({
        abi: wagmiContractConfig.abi,
        functionName: 'name',
      }),
    })

    expect(
      decodeFunctionResult({
        abi: wagmiContractConfig.abi,
        data: data!,
        functionName: 'name',
      }),
    ).toMatchInlineSnapshot(`"wagmi"`)
  })

  test('multicall', async () => {
    const code =
      '0x608060405234801561001057600080fd5b50610ee0806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e1461025a578063bce38bd714610275578063c3077fa914610288578063ee82ac5e1461029b57600080fd5b80634d2301cc146101ec57806372425d9d1461022157806382ad56cb1461023457806386d516e81461024757600080fd5b80633408e470116100c65780633408e47014610191578063399542e9146101a45780633e64a696146101c657806342cbb15c146101d957600080fd5b80630f28c97d146100f8578063174dea711461011a578063252dba421461013a57806327e86d6e1461015b575b600080fd5b34801561010457600080fd5b50425b6040519081526020015b60405180910390f35b61012d610128366004610a85565b6102ba565b6040516101119190610bbe565b61014d610148366004610a85565b6104ef565b604051610111929190610bd8565b34801561016757600080fd5b50437fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0140610107565b34801561019d57600080fd5b5046610107565b6101b76101b2366004610c60565b610690565b60405161011193929190610cba565b3480156101d257600080fd5b5048610107565b3480156101e557600080fd5b5043610107565b3480156101f857600080fd5b50610107610207366004610ce2565b73ffffffffffffffffffffffffffffffffffffffff163190565b34801561022d57600080fd5b5044610107565b61012d610242366004610a85565b6106ab565b34801561025357600080fd5b5045610107565b34801561026657600080fd5b50604051418152602001610111565b61012d610283366004610c60565b61085a565b6101b7610296366004610a85565b610a1a565b3480156102a757600080fd5b506101076102b6366004610d18565b4090565b60606000828067ffffffffffffffff8111156102d8576102d8610d31565b60405190808252806020026020018201604052801561031e57816020015b6040805180820190915260008152606060208201528152602001906001900390816102f65790505b5092503660005b8281101561047757600085828151811061034157610341610d60565b6020026020010151905087878381811061035d5761035d610d60565b905060200281019061036f9190610d8f565b6040810135958601959093506103886020850185610ce2565b73ffffffffffffffffffffffffffffffffffffffff16816103ac6060870187610dcd565b6040516103ba929190610e32565b60006040518083038185875af1925050503d80600081146103f7576040519150601f19603f3d011682016040523d82523d6000602084013e6103fc565b606091505b50602080850191909152901515808452908501351761046d577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b5050600101610325565b508234146104e6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601a60248201527f4d756c746963616c6c333a2076616c7565206d69736d6174636800000000000060448201526064015b60405180910390fd5b50505092915050565b436060828067ffffffffffffffff81111561050c5761050c610d31565b60405190808252806020026020018201604052801561053f57816020015b606081526020019060019003908161052a5790505b5091503660005b8281101561068657600087878381811061056257610562610d60565b90506020028101906105749190610e42565b92506105836020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff166105a66020850185610dcd565b6040516105b4929190610e32565b6000604051808303816000865af19150503d80600081146105f1576040519150601f19603f3d011682016040523d82523d6000602084013e6105f6565b606091505b5086848151811061060957610609610d60565b602090810291909101015290508061067d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060448201526064016104dd565b50600101610546565b5050509250929050565b43804060606106a086868661085a565b905093509350939050565b6060818067ffffffffffffffff8111156106c7576106c7610d31565b60405190808252806020026020018201604052801561070d57816020015b6040805180820190915260008152606060208201528152602001906001900390816106e55790505b5091503660005b828110156104e657600084828151811061073057610730610d60565b6020026020010151905086868381811061074c5761074c610d60565b905060200281019061075e9190610e76565b925061076d6020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff166107906040850185610dcd565b60405161079e929190610e32565b6000604051808303816000865af19150503d80600081146107db576040519150601f19603f3d011682016040523d82523d6000602084013e6107e0565b606091505b506020808401919091529015158083529084013517610851577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b50600101610714565b6060818067ffffffffffffffff81111561087657610876610d31565b6040519080825280602002602001820160405280156108bc57816020015b6040805180820190915260008152606060208201528152602001906001900390816108945790505b5091503660005b82811015610a105760008482815181106108df576108df610d60565b602002602001015190508686838181106108fb576108fb610d60565b905060200281019061090d9190610e42565b925061091c6020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff1661093f6020850185610dcd565b60405161094d929190610e32565b6000604051808303816000865af19150503d806000811461098a576040519150601f19603f3d011682016040523d82523d6000602084013e61098f565b606091505b506020830152151581528715610a07578051610a07576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060448201526064016104dd565b506001016108c3565b5050509392505050565b6000806060610a2b60018686610690565b919790965090945092505050565b60008083601f840112610a4b57600080fd5b50813567ffffffffffffffff811115610a6357600080fd5b6020830191508360208260051b8501011115610a7e57600080fd5b9250929050565b60008060208385031215610a9857600080fd5b823567ffffffffffffffff811115610aaf57600080fd5b610abb85828601610a39565b90969095509350505050565b6000815180845260005b81811015610aed57602081850181015186830182015201610ad1565b81811115610aff576000602083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b600082825180855260208086019550808260051b84010181860160005b84811015610bb1578583037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe001895281518051151584528401516040858501819052610b9d81860183610ac7565b9a86019a9450505090830190600101610b4f565b5090979650505050505050565b602081526000610bd16020830184610b32565b9392505050565b600060408201848352602060408185015281855180845260608601915060608160051b870101935082870160005b82811015610c52577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa0888703018452610c40868351610ac7565b95509284019290840190600101610c06565b509398975050505050505050565b600080600060408486031215610c7557600080fd5b83358015158114610c8557600080fd5b9250602084013567ffffffffffffffff811115610ca157600080fd5b610cad86828701610a39565b9497909650939450505050565b838152826020820152606060408201526000610cd96060830184610b32565b95945050505050565b600060208284031215610cf457600080fd5b813573ffffffffffffffffffffffffffffffffffffffff81168114610bd157600080fd5b600060208284031215610d2a57600080fd5b5035919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81833603018112610dc357600080fd5b9190910192915050565b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe1843603018112610e0257600080fd5b83018035915067ffffffffffffffff821115610e1d57600080fd5b602001915036819003821315610a7e57600080fd5b8183823760009101908152919050565b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc1833603018112610dc357600080fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa1833603018112610dc357600080fdfea2646970667358221220bb2b5c71a328032f97c676ae39a1ec2148d3e5d6f73d95e9b17910152d61f16264736f6c634300080c0033'

    const { data } = await call(client, {
      code,
      data: encodeFunctionData({
        abi: multicall3Abi,
        functionName: 'aggregate3',
        args: [
          [
            {
              target: wagmiContractConfig.address,
              allowFailure: true,
              callData: encodeFunctionData({
                abi: wagmiContractConfig.abi,
                functionName: 'name',
              }),
            },
            {
              target: wagmiContractConfig.address,
              allowFailure: true,
              callData: encodeFunctionData({
                abi: wagmiContractConfig.abi,
                functionName: 'totalSupply',
              }),
            },
          ],
        ],
      }),
    })

    expect(
      decodeFunctionResult({
        abi: multicall3Abi,
        data: data!,
        functionName: 'aggregate3',
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "returnData": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
          "success": true,
        },
        {
          "returnData": "0x0000000000000000000000000000000000000000000000000000000000000288",
          "success": true,
        },
      ]
    `)
  })
})

describe('getRevertErrorData', () => {
  test('default', () => {
    expect(getRevertErrorData(new Error('lol'))).toBe(undefined)
    expect(getRevertErrorData(new BaseError('lol'))).toBe(undefined)
    expect(
      getRevertErrorData(
        new BaseError('error', {
          cause: new RawContractError({ data: '0xdeadbeef' }),
        }),
      ),
    ).toBe('0xdeadbeef')
    expect(
      getRevertErrorData(
        new BaseError('error', {
          cause: new RawContractError({ data: '0x556f1830' }),
        }),
      ),
    ).toBe('0x556f1830')
    expect(
      getRevertErrorData(
        new BaseError('error', {
          cause: new RawContractError({ data: { data: '0x556f1830' } }),
        }),
      ),
    ).toBe('0x556f1830')
  })
})
