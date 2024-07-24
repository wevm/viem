import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { RpcRequestError } from '../../../errors/request.js'
import { getHttpRpcClient, parseEther } from '../../../utils/index.js'
import { sendCalls } from './sendCalls.js'

const getClient = ({
  onRequest,
}: { onRequest({ method, params }: any): void }) =>
  createClient({
    transport: custom({
      async request({ method, params }) {
        if (method !== 'wallet_sendCalls') return

        onRequest({ method, params })

        const rpcClient = getHttpRpcClient(anvilMainnet.rpcUrl.http)
        for (const call of params[0].calls) {
          const { error } = await rpcClient.request({
            body: {
              method: 'eth_sendTransaction',
              params: [call],
              id: 0,
            },
          })
          if (error)
            throw new RpcRequestError({
              body: { method, params },
              error,
              url: anvilMainnet.rpcUrl.http,
            })
        }
        return '0xdeadbeef'
      },
    }),
  })

test('default', async () => {
  const requests: unknown[] = []

  const client = getClient({
    onRequest({ params }) {
      requests.push(params)
    },
  })

  const id_ = await sendCalls(client, {
    account: accounts[0].address,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
      },
      {
        to: accounts[2].address,
      },
      {
        data: '0xcafebabe',
        to: accounts[3].address,
        value: parseEther('100'),
      },
    ],
    chain: mainnet,
  })

  expect(id_).toMatchInlineSnapshot(`"0xdeadbeef"`)
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "calls": [
            {
              "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
              "value": "0xde0b6b3a7640000",
            },
            {
              "to": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
              "value": undefined,
            },
            {
              "data": "0xcafebabe",
              "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
              "value": "0x56bc75e2d63100000",
            },
          ],
          "capabilities": undefined,
          "chainId": "0x1",
          "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "version": "1.0",
        },
      ],
    ]
  `)
})

test('error: no chain', async () => {
  const requests: unknown[] = []

  const client = getClient({
    onRequest({ params }) {
      requests.push(params)
    },
  })

  await expect(() =>
    // @ts-expect-error
    sendCalls(client, {
      account: accounts[0].address,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
          value: parseEther('10'),
        },
        {
          data: '0xcafebabe',
          to: accounts[3].address,
          value: parseEther('1000000'),
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainNotFoundError: No chain was provided to the request.
    Please provide a chain with the \`chain\` argument on the Action, or by supplying a \`chain\` to WalletClient.

    Version: viem@x.y.z]
  `)
})

test('error: no account', async () => {
  const requests: unknown[] = []

  const client = getClient({
    onRequest({ params }) {
      requests.push(params)
    },
  })

  await expect(() =>
    // @ts-expect-error
    sendCalls(client, {
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
          value: parseEther('10'),
        },
        {
          data: '0xcafebabe',
          to: accounts[3].address,
          value: parseEther('1000000'),
        },
      ],
      chain: mainnet,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Docs: https://viem.sh/experimental/eip5792/sendCalls#account
    Version: viem@x.y.z]
  `)
})

test('error: insufficient funds', async () => {
  const requests: unknown[] = []

  const client = getClient({
    onRequest({ params }) {
      requests.push(params)
    },
  })

  await expect(() =>
    sendCalls(client, {
      account: accounts[0].address,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
          value: parseEther('10'),
        },
        {
          data: '0xcafebabe',
          to: accounts[3].address,
          value: parseEther('1000000'),
        },
      ],
      chain: mainnet,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

    This error could arise when the account does not have enough funds to:
     - pay for the total gas fee,
     - pay for the value to send.
     
    The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
     - \`gas\` is the amount of gas needed for transaction to execute,
     - \`gas fee\` is the gas fee,
     - \`value\` is the amount of ether to send to the recipient.
     
    Request Arguments:
      chain:  Ethereum (id: 1)
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Details: Insufficient funds for gas * price + value
    Version: viem@x.y.z]
  `)
})
