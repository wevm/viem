import { describe, expect, test, vi } from 'vitest'

import { OffchainLookupExample } from '~test/contracts/generated.js'
import { baycContractConfig, usdcContractConfig } from '~test/src/abis.js'
import { createCcipServer } from '~test/src/ccip.js'
import { accounts } from '~test/src/constants.js'
import { blobData, kzg } from '~test/src/kzg.js'
import { deployOffchainLookupExample, mainnetClient } from '~test/src/utils.js'

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
  encodeAbiParameters,
  pad,
  parseEther,
  stringToHex,
  toBlobs,
  toHex,
} from '../../index.js'
import { call, getRevertErrorData } from './call.js'

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
