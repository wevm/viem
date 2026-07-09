import { Blobs, Hex, TransactionRequest, Value } from 'ox'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as Http from '~test/http.js'
import { kzg } from '~test/kzg.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Client, http, RpcError } from 'viem'
import { mainnet } from 'viem/chains'

const client = anvil.getClient(anvil.mainnet)

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const maxUint256 = 2n ** 256n - 1n

const sourceAccount = constants.accounts[0]
const targetAccount = constants.accounts[1]

test('estimates gas', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      to: targetAccount.address,
      value: Value.fromEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

describe.each([
  ['json-rpc (Account.from)', Account.from(sourceAccount.address)],
  [
    'local (Account.fromPrivateKey)',
    Account.fromPrivateKey(sourceAccount.privateKey),
  ],
] as const)('account: %s', (_name, account) => {
  test('value transfer', async () => {
    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: authorizationList', async () => {
    const eoa = Account.fromPrivateKey(targetAccount.privateKey)
    const authorization = await eoa.signAuthorization!({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      chainId: 1,
      nonce: 0n,
    })

    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        authorizationList: [authorization],
        data: '0xdeadbeef',
      }),
    ).toBeTypeOf('bigint')
  })

  test('args: blobs (derives versioned hashes locally)', async () => {
    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        blobs: Blobs.from('0x1234'),
        kzg,
        maxFeePerBlobGas: Value.fromGwei('20'),
        to: targetAccount.address,
      }),
    ).toMatchInlineSnapshot('21001n')
  })

  test('args: blockNumber', async () => {
    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        blockNumber: anvil.mainnet.forkBlockNumber,
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: data', async () => {
    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
        to: wethAddress,
      }),
    ).toMatchInlineSnapshot('26040n')
  })

  test('args: deployment (no `to`)', async () => {
    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        data: generated.Erc721.bytecode.object,
      }),
    ).toBeTypeOf('bigint')
  })

  test('args: gas', async () => {
    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        gas: Value.fromGwei('2'),
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: gasPrice', async () => {
    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        gasPrice: Value.fromGwei('33'),
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: maxFeePerGas', async () => {
    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        maxFeePerGas: Value.fromGwei('33'),
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: maxPriorityFeePerGas', async () => {
    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        maxPriorityFeePerGas: Value.fromGwei('2'),
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: nonce', async () => {
    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        nonce: 69,
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: stateOverride', async () => {
    const transferData =
      '0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000de0b6b3a7640000'
    const balanceSlot =
      '0xc651ee22c6951bb8b5bd29e8210fb394645a94315fe10eff2cc73de1aa75c137'

    expect(
      await Actions.transaction.estimateGas(client, {
        account,
        data: transferData,
        stateOverride: {
          [wethAddress]: {
            stateDiff: {
              [balanceSlot]: Hex.fromNumber(maxUint256, { size: 32 }),
            },
          },
        },
        to: wethAddress,
      }),
    ).toMatchInlineSnapshot('51594n')
  })
})

describe('errors', () => {
  test('cannot infer `to` from `authorizationList`', async () => {
    await expect(() =>
      Actions.transaction.estimateGas(client, {
        account: sourceAccount.address,
        authorizationList: [
          {
            address: '0x0000000000000000000000000000000000000000',
            chainId: 1,
            nonce: 0n,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
            yParity: 0,
          },
        ],
        data: '0xdeadbeef',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [RpcError.ExecutionError: \`to\` is required. Could not infer from \`authorizationList\`

      Request Arguments:
        from:               0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        authorizationList:
          - address:  0x0000000000000000000000000000000000000000
            chainId:  1
            nonce:    0
            r:        0x0000000000000000000000000000000000000000000000000000000000000000
            s:        0x0000000000000000000000000000000000000000000000000000000000000000
            yParity:  0
        data:               0xdeadbeef

      Details: \`to\` is required. Could not infer from \`authorizationList\`
      Version: viem@2.52.1]
    `)
  })

  test('fee cap too high', async () => {
    await expect(() =>
      Actions.transaction.estimateGas(client, {
        account: sourceAccount.address,
        maxFeePerGas: maxUint256 + 1n,
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [RpcError.ExecutionError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Request Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH

      Details: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).
      Version: viem@2.52.1]
    `)
  })

  test('aborted request is not wrapped', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(() =>
      Actions.transaction.estimateGas(client, {
        account: sourceAccount.address,
        requestOptions: { signal: controller.signal },
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).rejects.toThrowError()
  })

  test('node error (execution reverted)', async () => {
    // Transfer of 1 WETH from an account that holds none reverts on-chain.
    const transferData =
      '0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000de0b6b3a7640000'
    await expect(() =>
      Actions.transaction.estimateGas(client, {
        account: targetAccount.address,
        data: transferData,
        to: wethAddress,
      }),
    ).rejects.toThrowError(RpcError.ExecutionError)
  })

  test('tip higher than fee cap', async () => {
    await expect(() =>
      Actions.transaction.estimateGas(client, {
        account: sourceAccount.address,
        maxFeePerGas: Value.fromGwei('10'),
        maxPriorityFeePerGas: Value.fromGwei('11'),
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [RpcError.ExecutionError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

      Request Arguments:
        from:                  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        maxFeePerGas:          10 gwei
        maxPriorityFeePerGas:  11 gwei
        to:                    0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:                 1 ETH

      Details: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).
      Version: viem@2.52.1]
    `)
  })
})

describe('behavior: chain schema', () => {
  test('encodes the request via the chain request converter', async () => {
    // The generic tuple encoding strips fields it does not know; a chain
    // request converter must own the request encoding so chain-specific fields
    // (`feeToken` here) reach the node.
    let body: any
    const server = await Http.createServer((req, res) => {
      let data = ''
      req.on('data', (chunk) => {
        data += chunk
      })
      req.on('end', () => {
        body = JSON.parse(data)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({ id: body.id, jsonrpc: '2.0', result: '0x5208' }),
        )
      })
    })
    try {
      const chain = mainnet.extend({
        schema: {
          transactionRequest: {
            toRpc: (request: any) => ({
              ...TransactionRequest.toRpc(request),
              feeToken: request.feeToken,
            }),
          },
        },
      })
      const client = Client.create({ chain, transport: http(server.url) })

      const gas = await Actions.transaction.estimateGas(client, {
        account: sourceAccount.address,
        feeToken: '0x20c0000000000000000000000000000000000001',
        to: targetAccount.address,
        value: 1n,
      } as never)

      expect(gas).toBe(21000n)
      expect(body.params).toMatchInlineSnapshot(`
        [
          {
            "feeToken": "0x20c0000000000000000000000000000000000001",
            "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
            "value": "0x1",
          },
          "latest",
        ]
      `)
    } finally {
      await server.close()
    }
  })
})
