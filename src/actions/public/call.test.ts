import { describe, expect, test, vi } from 'vitest'

import {
  Mock4337Account,
  Mock4337AccountFactory,
  OffchainLookupExample,
} from '~test/contracts/generated.js'
import {
  baycContractConfig,
  usdcContractConfig,
  wagmiContractConfig,
} from '~test/src/abis.js'
import { createCcipServer } from '~test/src/ccip.js'
import { accounts } from '~test/src/constants.js'
import { blobData, kzg } from '~test/src/kzg.js'
import {
  deployMock4337Account,
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
    ).rejects.toMatchInlineSnapshot(`
      [CallExecutionError: Execution reverted with reason: custom error 556f1830:000000000000000000000000cc5bc84c…00000000000000000000000000000000 (576 bytes).

      Raw Call Arguments:
        to:    0xcc5bc84c3fdbcf262aadd9f76652d6784293dd9e
        data:  0xbf40fac1000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000096a786f6d2e7669656d0000000000000000000000000000000000000000000000

      Details: execution reverted: custom error 556f1830:000000000000000000000000cc5bc84c…00000000000000000000000000000000 (576 bytes)
      Version: viem@x.y.z]
    `)

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

test('args: blockNumber', async () => {
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
    const { factoryAddress } = await deployMock4337Account()

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
    expect(result).toMatchInlineSnapshot(`
      {
        "data": "0x0f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000d8a0ab4f74d04b9ee34ceccef647051601720dc100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000f4d6f636b343333374163636f756e740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000131000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      }
    `)

    const decoded = decodeFunctionResult({
      abi: Mock4337Account.abi,
      data: result.data!,
      functionName: 'eip712Domain',
    })
    expect(decoded).toMatchInlineSnapshot(`
      [
        "0x0f",
        "Mock4337Account",
        "1",
        1n,
        "0xd8a0AB4f74d04b9EE34CECCEF647051601720Dc1",
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
    const bytecode =
      '0x608060405260006007553480156200001657600080fd5b50604051806040016040528060058152602001647761676d6960d81b815250604051806040016040528060058152602001645741474d4960d81b81525081600090805190602001906200006b9291906200008a565b508051620000819060019060208401906200008a565b5050506200016c565b828054620000989062000130565b90600052602060002090601f016020900481019282620000bc576000855562000107565b82601f10620000d757805160ff191683800117855562000107565b8280016001018555821562000107579182015b8281111562000107578251825591602001919060010190620000ea565b506200011592915062000119565b5090565b5b808211156200011557600081556001016200011a565b600181811c908216806200014557607f821691505b6020821081036200016657634e487b7160e01b600052602260045260246000fd5b50919050565b6128c2806200017c6000396000f3fe608060405234801561001057600080fd5b50600436106101005760003560e01c80636352211e11610097578063a22cb46511610066578063a22cb46514610215578063b88d4fde14610228578063c87b56dd1461023b578063e985e9c51461024e57600080fd5b80636352211e146101d457806370a08231146101e757806395d89b41146101fa578063a0712d681461020257600080fd5b80631249c58b116100d35780631249c58b1461018f57806318160ddd1461019757806323b872dd146101ae57806342842e0e146101c157600080fd5b806301ffc9a71461010557806306fdde031461012d578063081812fc14610142578063095ea7b31461017a575b600080fd5b61011861011336600461178f565b610297565b60405190151581526020015b60405180910390f35b61013561037c565b6040516101249190611829565b61015561015036600461183c565b61040e565b60405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610124565b61018d61018836600461187e565b6104d3565b005b61018d61062b565b6101a060065481565b604051908152602001610124565b61018d6101bc3660046118a8565b61067d565b61018d6101cf3660046118a8565b610704565b6101556101e236600461183c565b61071f565b6101a06101f53660046118e4565b6107b7565b61013561086b565b61018d61021036600461183c565b61087a565b61018d6102233660046118ff565b610902565b61018d61023636600461196a565b610911565b61013561024936600461183c565b61099f565b61011861025c366004611a64565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260056020908152604080832093909416825291909152205460ff1690565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f80ac58cd00000000000000000000000000000000000000000000000000000000148061032a57507fffffffff0000000000000000000000000000000000000000000000000000000082167f5b5e139f00000000000000000000000000000000000000000000000000000000145b8061037657507f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b92915050565b60606000805461038b90611a97565b80601f01602080910402602001604051908101604052809291908181526020018280546103b790611a97565b80156104045780601f106103d957610100808354040283529160200191610404565b820191906000526020600020905b8154815290600101906020018083116103e757829003601f168201915b5050505050905090565b60008181526002602052604081205473ffffffffffffffffffffffffffffffffffffffff166104aa5760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e000000000000000000000000000000000000000060648201526084015b60405180910390fd5b5060009081526004602052604090205473ffffffffffffffffffffffffffffffffffffffff1690565b60006104de8261071f565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036105815760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560448201527f720000000000000000000000000000000000000000000000000000000000000060648201526084016104a1565b3373ffffffffffffffffffffffffffffffffffffffff821614806105aa57506105aa813361025c565b61061c5760405162461bcd60e51b815260206004820152603860248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760448201527f6e6572206e6f7220617070726f76656420666f7220616c6c000000000000000060648201526084016104a1565b6106268383610b07565b505050565b6007545b60008181526002602052604090205473ffffffffffffffffffffffffffffffffffffffff16156106615760010161062f565b61066b3382610ba7565b60068054600190810190915501600755565b6106873382610bc1565b6106f95760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f76656400000000000000000000000000000060648201526084016104a1565b610626838383610d17565b61062683838360405180602001604052806000815250610911565b60008181526002602052604081205473ffffffffffffffffffffffffffffffffffffffff16806103765760405162461bcd60e51b815260206004820152602960248201527f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460448201527f656e7420746f6b656e000000000000000000000000000000000000000000000060648201526084016104a1565b600073ffffffffffffffffffffffffffffffffffffffff82166108425760405162461bcd60e51b815260206004820152602a60248201527f4552433732313a2062616c616e636520717565727920666f7220746865207a6560448201527f726f20616464726573730000000000000000000000000000000000000000000060648201526084016104a1565b5073ffffffffffffffffffffffffffffffffffffffff1660009081526003602052604090205490565b60606001805461038b90611a97565b60008181526002602052604090205473ffffffffffffffffffffffffffffffffffffffff16156108ec5760405162461bcd60e51b815260206004820152601160248201527f546f6b656e2049442069732074616b656e00000000000000000000000000000060448201526064016104a1565b6108f63382610ba7565b50600680546001019055565b61090d338383610f4a565b5050565b61091b3383610bc1565b61098d5760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f76656400000000000000000000000000000060648201526084016104a1565b6109998484848461105d565b50505050565b6040517f666f726567726f756e64000000000000000000000000000000000000000000006020820152602a810182905260609060009061016890604a016040516020818303038152906040528051906020012060001c6109ff9190611b19565b6040517f6261636b67726f756e64000000000000000000000000000000000000000000006020820152602a810185905290915060009061016890604a016040516020818303038152906040528051906020012060001c610a5f9190611b19565b90506000610aba610a6f866110e6565b610aa9610a7b866110e6565b610a84866110e6565b604051602001610a95929190611b2d565b60405160208183030381529060405261121b565b604051602001610a959291906125ba565b9050600081604051602001610acf919061268b565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529190529695505050505050565b600081815260046020526040902080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff84169081179091558190610b618261071f565b73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b61090d82826040518060200160405280600081525061136e565b60008181526002602052604081205473ffffffffffffffffffffffffffffffffffffffff16610c585760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e000000000000000000000000000000000000000060648201526084016104a1565b6000610c638361071f565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161480610cd1575073ffffffffffffffffffffffffffffffffffffffff80821660009081526005602090815260408083209388168352929052205460ff165b80610d0f57508373ffffffffffffffffffffffffffffffffffffffff16610cf78461040e565b73ffffffffffffffffffffffffffffffffffffffff16145b949350505050565b8273ffffffffffffffffffffffffffffffffffffffff16610d378261071f565b73ffffffffffffffffffffffffffffffffffffffff1614610dc05760405162461bcd60e51b815260206004820152602560248201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060448201527f6f776e657200000000000000000000000000000000000000000000000000000060648201526084016104a1565b73ffffffffffffffffffffffffffffffffffffffff8216610e485760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f2061646460448201527f726573730000000000000000000000000000000000000000000000000000000060648201526084016104a1565b610e53600082610b07565b73ffffffffffffffffffffffffffffffffffffffff83166000908152600360205260408120805460019290610e899084906126ff565b909155505073ffffffffffffffffffffffffffffffffffffffff82166000908152600360205260408120805460019290610ec4908490612716565b909155505060008181526002602052604080822080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff86811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610fc55760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c65720000000000000060448201526064016104a1565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526005602090815260408083209487168084529482529182902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b611068848484610d17565b611074848484846113f7565b6109995760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e746572000000000000000000000000000060648201526084016104a1565b60608160000361112957505060408051808201909152600181527f3000000000000000000000000000000000000000000000000000000000000000602082015290565b8160005b8115611153578061113d8161272e565b915061114c9050600a83612766565b915061112d565b60008167ffffffffffffffff81111561116e5761116e61193b565b6040519080825280601f01601f191660200182016040528015611198576020820181803683370190505b5090505b8415610d0f576111ad6001836126ff565b91506111ba600a86611b19565b6111c5906030612716565b60f81b8183815181106111da576111da61277a565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350611214600a86612766565b945061119c565b6060815160000361123a57505060408051602081019091526000815290565b600060405180606001604052806040815260200161284d60409139905060006003845160026112699190612716565b6112739190612766565b61127e9060046127a9565b67ffffffffffffffff8111156112965761129661193b565b6040519080825280601f01601f1916602001820160405280156112c0576020820181803683370190505b509050600182016020820185865187015b8082101561132c576003820191508151603f8160121c168501518453600184019350603f81600c1c168501518453600184019350603f8160061c168501518453600184019350603f81168501518453506001830192506112d1565b5050600386510660018114611348576002811461135b57611363565b603d6001830353603d6002830353611363565b603d60018303535b509195945050505050565b61137883836115d0565b61138560008484846113f7565b6106265760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e746572000000000000000000000000000060648201526084016104a1565b600073ffffffffffffffffffffffffffffffffffffffff84163b156115c5576040517f150b7a0200000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff85169063150b7a029061146e9033908990889088906004016127e6565b6020604051808303816000875af19250505080156114c7575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01682019092526114c49181019061282f565b60015b61157a573d8080156114f5576040519150601f19603f3d011682016040523d82523d6000602084013e6114fa565b606091505b5080516000036115725760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e746572000000000000000000000000000060648201526084016104a1565b805181602001fd5b7fffffffff00000000000000000000000000000000000000000000000000000000167f150b7a0200000000000000000000000000000000000000000000000000000000149050610d0f565b506001949350505050565b73ffffffffffffffffffffffffffffffffffffffff82166116335760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f206164647265737360448201526064016104a1565b60008181526002602052604090205473ffffffffffffffffffffffffffffffffffffffff16156116a55760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e7465640000000060448201526064016104a1565b73ffffffffffffffffffffffffffffffffffffffff821660009081526003602052604081208054600192906116db908490612716565b909155505060008181526002602052604080822080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b7fffffffff000000000000000000000000000000000000000000000000000000008116811461178c57600080fd5b50565b6000602082840312156117a157600080fd5b81356117ac8161175e565b9392505050565b60005b838110156117ce5781810151838201526020016117b6565b838111156109995750506000910152565b600081518084526117f78160208601602086016117b3565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b6020815260006117ac60208301846117df565b60006020828403121561184e57600080fd5b5035919050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461187957600080fd5b919050565b6000806040838503121561189157600080fd5b61189a83611855565b946020939093013593505050565b6000806000606084860312156118bd57600080fd5b6118c684611855565b92506118d460208501611855565b9150604084013590509250925092565b6000602082840312156118f657600080fd5b6117ac82611855565b6000806040838503121561191257600080fd5b61191b83611855565b91506020830135801515811461193057600080fd5b809150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000806000806080858703121561198057600080fd5b61198985611855565b935061199760208601611855565b925060408501359150606085013567ffffffffffffffff808211156119bb57600080fd5b818701915087601f8301126119cf57600080fd5b8135818111156119e1576119e161193b565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f01168101908382118183101715611a2757611a2761193b565b816040528281528a6020848701011115611a4057600080fd5b82602086016020830137600060208483010152809550505050505092959194509250565b60008060408385031215611a7757600080fd5b611a8083611855565b9150611a8e60208401611855565b90509250929050565b600181811c90821680611aab57607f821691505b602082108103611ae4577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600082611b2857611b28611aea565b500690565b7f3c73766720786d6c6e733d22687474703a2f2f7777772e77332e6f72672f323081527f30302f737667222077696474683d223130323422206865696768743d2231303260208201527f34222066696c6c3d226e6f6e65223e3c706174682066696c6c3d2268736c2800604082015260008351611bb181605f8501602088016117b3565b7f2c20313030252c20313025292220643d224d3020306831303234763130323448605f918401918201527f307a22202f3e3c672066696c6c3d2268736c2800000000000000000000000000607f8201528351611c148160928401602088016117b3565b7f2c20313030252c2039302529223e3c7061746820643d224d393033203433372e609292909101918201527f35633020392e3131332d372e3338382031362e352d31362e352031362e35732d60b28201527f31362e352d372e3338372d31362e352d31362e3520372e3338382d31362e352060d28201527f31362e352d31362e352031362e3520372e3338372031362e352031362e357a4d60f28201527f3639382e3532392035363663362e39323120302031322e35332d352e353936206101128201527f31322e35332d31322e35762d353063302d362e39303420352e3630392d31322e6101328201527f352031322e3532392d31322e356832352e30353963362e393220302031322e356101528201527f323920352e3539362031322e3532392031322e35763530633020362e393034206101728201527f352e3630392031322e352031322e35332031322e357331322e3532392d352e356101928201527f39362031322e3532392d31322e35762d353063302d362e39303420352e3630396101b28201527f2d31322e352031322e35332d31322e356832352e30353963362e3932203020316101d28201527f322e35323920352e3539362031322e3532392031322e35763530633020362e396101f28201527f303420352e3630392031322e352031322e3532392031322e356833372e3538396102128201527f63362e393220302031322e3532392d352e3539362031322e3532392d31322e356102328201527f762d373563302d362e3930342d352e3630392d31322e352d31322e3532392d316102528201527f322e35732d31322e353320352e3539362d31322e35332031322e357635362e326102728201527f3561362e32363420362e3236342030203120312d31322e3532392030563437386102928201527f2e3563302d362e3930342d352e3630392d31322e352d31322e35332d31322e356102b28201527f483639382e353239632d362e393220302d31322e35323920352e3539362d31326102d28201527f2e3532392031322e35763735633020362e39303420352e3630392031322e35206102f28201527f31322e3532392031322e357a22202f3e3c7061746820643d224d3135372e36356103128201527f3520353431632d362e39333220302d31322e3535322d352e3539362d31322e356103328201527f35322d31322e35762d353063302d362e3930342d352e3631392d31322e352d316103528201527f322e3535312d31322e3553313230203437312e35393620313230203437382e356103728201527f763735633020362e39303420352e36322031322e352031322e3535322031322e6103928201527f35683135302e363263362e39333320302031322e3535322d352e3539362031326103b28201527f2e3535322d31322e35762d353063302d362e39303420352e3631392d31322e356103d28201527f2031322e3535322d31322e35683134342e33343563332e343635203020362e326103f28201527f373620322e37393820362e32373620362e3235732d322e38313120362e32352d6104128201527f362e32373620362e3235483332302e383238632d362e39333320302d31322e356104328201527f353220352e3539362d31322e3535322031322e357633372e35633020362e39306104528201527f3420352e3631392031322e352031322e3535322031322e35683135302e3632636104728201527f362e39333320302031322e3535322d352e3539362031322e3535322d31322e356104928201527f762d373563302d362e3930342d352e3631392d31322e352d31322e3535322d316104b28201527f322e35483238332e313732632d362e39333220302d31322e35353120352e35396104d28201527f362d31322e3535312031322e35763530633020362e3930342d352e36313920316104f28201527f322e352d31322e3535322031322e35682d32352e313033632d362e39333320306105128201527f2d31322e3535322d352e3539362d31322e3535322d31322e35762d353063302d6105328201527f362e3930342d352e36322d31322e352d31322e3535322d31322e35732d31322e6105528201527f35353220352e3539362d31322e3535322031322e35763530633020362e3930346105728201527f2d352e3631392031322e352d31322e3535312031322e35682d32352e3130347a6105928201527f6d3330312e3234322d362e3235633020332e3435322d322e38313120362e32356105b28201527f2d362e32373620362e3235483333392e363535632d332e34363520302d362e326105d28201527f37362d322e3739382d362e3237362d362e323573322e3831312d362e323520366105f28201527f2e3237362d362e3235683131322e39363663332e343635203020362e323736206106128201527f322e37393820362e32373620362e32357a4d343937203535332e3831386330206106328201527f362e39323920352e3632382031322e3534362031322e3537312031322e3534366106528201527f6831333261362e323820362e323820302030203120362e32383620362e3237326106728201527f20362e323820362e32382030203020312d362e32383620362e323733682d31336106928201527f32632d362e39343320302d31322e35373120352e3631362d31322e35373120316106b28201527f322e3534364131322e35362031322e3536203020302030203530392e353731206106d28201527f363034683135302e38353863362e39343320302031322e3537312d352e3631366106f28201527f2031322e3537312d31322e353435762d3131322e393163302d362e3932382d356107128201527f2e3632382d31322e3534352d31322e3537312d31322e353435483530392e35376107328201527f31632d362e39343320302d31322e35373120352e3631372d31322e35373120316107528201527f322e3534357637352e3237337a6d33372e3731342d36322e373237632d362e396107728201527f343320302d31322e35373120352e3631372d31322e3537312031322e353435766107928201527f32352e303931633020362e39323920352e3632382031322e3534362031322e356107b28201527f37312031322e353436683130302e35373263362e39343320302031322e3537316107d28201527f2d352e3631372031322e3537312d31322e353436762d32352e30393163302d366107f28201527f2e3932382d352e3632382d31322e3534352d31322e3537312d31322e353435486108128201527f3533342e3731347a222066696c6c2d72756c653d226576656e6f646422202f3e6108328201527f3c2f673e3c2f7376673e0000000000000000000000000000000000000000000061085282015261085c01949350505050565b7f7b226e616d65223a20227761676d6920230000000000000000000000000000008152600083516125f28160118501602088016117b3565b7f222c2022696d616765223a2022646174613a696d6167652f7376672b786d6c3b6011918401918201527f6261736536342c00000000000000000000000000000000000000000000000000603182015283516126558160388401602088016117b3565b7f227d00000000000000000000000000000000000000000000000000000000000060389290910191820152603a01949350505050565b7f646174613a6170706c69636174696f6e2f6a736f6e3b6261736536342c0000008152600082516126c381601d8501602087016117b3565b91909101601d0192915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600082821015612711576127116126d0565b500390565b60008219821115612729576127296126d0565b500190565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361275f5761275f6126d0565b5060010190565b60008261277557612775611aea565b500490565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156127e1576127e16126d0565b500290565b600073ffffffffffffffffffffffffffffffffffffffff80871683528086166020840152508360408301526080606083015261282560808301846117df565b9695505050505050565b60006020828403121561284157600080fd5b81516117ac8161175e56fe4142434445464748494a4b4c4d4e4f505152535455565758595a6162636465666768696a6b6c6d6e6f707172737475767778797a303132333435363738392b2fa26469706673582212201665a4f9111990d7529375848d3fd02c0121091a940da59e763eba826e7b077064736f6c634300080d0033'

    const { data } = await call(client, {
      bytecode,
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
    const bytecode =
      '0x608060405234801561001057600080fd5b50610ee0806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e1461025a578063bce38bd714610275578063c3077fa914610288578063ee82ac5e1461029b57600080fd5b80634d2301cc146101ec57806372425d9d1461022157806382ad56cb1461023457806386d516e81461024757600080fd5b80633408e470116100c65780633408e47014610191578063399542e9146101a45780633e64a696146101c657806342cbb15c146101d957600080fd5b80630f28c97d146100f8578063174dea711461011a578063252dba421461013a57806327e86d6e1461015b575b600080fd5b34801561010457600080fd5b50425b6040519081526020015b60405180910390f35b61012d610128366004610a85565b6102ba565b6040516101119190610bbe565b61014d610148366004610a85565b6104ef565b604051610111929190610bd8565b34801561016757600080fd5b50437fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0140610107565b34801561019d57600080fd5b5046610107565b6101b76101b2366004610c60565b610690565b60405161011193929190610cba565b3480156101d257600080fd5b5048610107565b3480156101e557600080fd5b5043610107565b3480156101f857600080fd5b50610107610207366004610ce2565b73ffffffffffffffffffffffffffffffffffffffff163190565b34801561022d57600080fd5b5044610107565b61012d610242366004610a85565b6106ab565b34801561025357600080fd5b5045610107565b34801561026657600080fd5b50604051418152602001610111565b61012d610283366004610c60565b61085a565b6101b7610296366004610a85565b610a1a565b3480156102a757600080fd5b506101076102b6366004610d18565b4090565b60606000828067ffffffffffffffff8111156102d8576102d8610d31565b60405190808252806020026020018201604052801561031e57816020015b6040805180820190915260008152606060208201528152602001906001900390816102f65790505b5092503660005b8281101561047757600085828151811061034157610341610d60565b6020026020010151905087878381811061035d5761035d610d60565b905060200281019061036f9190610d8f565b6040810135958601959093506103886020850185610ce2565b73ffffffffffffffffffffffffffffffffffffffff16816103ac6060870187610dcd565b6040516103ba929190610e32565b60006040518083038185875af1925050503d80600081146103f7576040519150601f19603f3d011682016040523d82523d6000602084013e6103fc565b606091505b50602080850191909152901515808452908501351761046d577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b5050600101610325565b508234146104e6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601a60248201527f4d756c746963616c6c333a2076616c7565206d69736d6174636800000000000060448201526064015b60405180910390fd5b50505092915050565b436060828067ffffffffffffffff81111561050c5761050c610d31565b60405190808252806020026020018201604052801561053f57816020015b606081526020019060019003908161052a5790505b5091503660005b8281101561068657600087878381811061056257610562610d60565b90506020028101906105749190610e42565b92506105836020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff166105a66020850185610dcd565b6040516105b4929190610e32565b6000604051808303816000865af19150503d80600081146105f1576040519150601f19603f3d011682016040523d82523d6000602084013e6105f6565b606091505b5086848151811061060957610609610d60565b602090810291909101015290508061067d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060448201526064016104dd565b50600101610546565b5050509250929050565b43804060606106a086868661085a565b905093509350939050565b6060818067ffffffffffffffff8111156106c7576106c7610d31565b60405190808252806020026020018201604052801561070d57816020015b6040805180820190915260008152606060208201528152602001906001900390816106e55790505b5091503660005b828110156104e657600084828151811061073057610730610d60565b6020026020010151905086868381811061074c5761074c610d60565b905060200281019061075e9190610e76565b925061076d6020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff166107906040850185610dcd565b60405161079e929190610e32565b6000604051808303816000865af19150503d80600081146107db576040519150601f19603f3d011682016040523d82523d6000602084013e6107e0565b606091505b506020808401919091529015158083529084013517610851577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b50600101610714565b6060818067ffffffffffffffff81111561087657610876610d31565b6040519080825280602002602001820160405280156108bc57816020015b6040805180820190915260008152606060208201528152602001906001900390816108945790505b5091503660005b82811015610a105760008482815181106108df576108df610d60565b602002602001015190508686838181106108fb576108fb610d60565b905060200281019061090d9190610e42565b925061091c6020840184610ce2565b73ffffffffffffffffffffffffffffffffffffffff1661093f6020850185610dcd565b60405161094d929190610e32565b6000604051808303816000865af19150503d806000811461098a576040519150601f19603f3d011682016040523d82523d6000602084013e61098f565b606091505b506020830152151581528715610a07578051610a07576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060448201526064016104dd565b506001016108c3565b5050509392505050565b6000806060610a2b60018686610690565b919790965090945092505050565b60008083601f840112610a4b57600080fd5b50813567ffffffffffffffff811115610a6357600080fd5b6020830191508360208260051b8501011115610a7e57600080fd5b9250929050565b60008060208385031215610a9857600080fd5b823567ffffffffffffffff811115610aaf57600080fd5b610abb85828601610a39565b90969095509350505050565b6000815180845260005b81811015610aed57602081850181015186830182015201610ad1565b81811115610aff576000602083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b600082825180855260208086019550808260051b84010181860160005b84811015610bb1578583037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe001895281518051151584528401516040858501819052610b9d81860183610ac7565b9a86019a9450505090830190600101610b4f565b5090979650505050505050565b602081526000610bd16020830184610b32565b9392505050565b600060408201848352602060408185015281855180845260608601915060608160051b870101935082870160005b82811015610c52577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa0888703018452610c40868351610ac7565b95509284019290840190600101610c06565b509398975050505050505050565b600080600060408486031215610c7557600080fd5b83358015158114610c8557600080fd5b9250602084013567ffffffffffffffff811115610ca157600080fd5b610cad86828701610a39565b9497909650939450505050565b838152826020820152606060408201526000610cd96060830184610b32565b95945050505050565b600060208284031215610cf457600080fd5b813573ffffffffffffffffffffffffffffffffffffffff81168114610bd157600080fd5b600060208284031215610d2a57600080fd5b5035919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81833603018112610dc357600080fd5b9190910192915050565b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe1843603018112610e0257600080fd5b83018035915067ffffffffffffffff821115610e1d57600080fd5b602001915036819003821315610a7e57600080fd5b8183823760009101908152919050565b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc1833603018112610dc357600080fd5b600082357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa1833603018112610dc357600080fdfea2646970667358221220bb2b5c71a328032f97c676ae39a1ec2148d3e5d6f73d95e9b17910152d61f16264736f6c634300080c0033'

    const { data } = await call(client, {
      bytecode,
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
          "returnData": "0x0000000000000000000000000000000000000000000000000000000000000277",
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
