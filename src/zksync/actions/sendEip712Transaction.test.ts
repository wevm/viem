import { createClient, http } from 'viem'
import { getTransaction } from 'viem/actions'
import { expect, test } from 'vitest'
import { anvilZksync } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { createRpcProxy } from '~test/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import type { EIP1193RequestFn } from '../../index.js'
import type { ZksyncTransactionRequestEIP712 } from '../../zksync/index.js'
import { sendEip712Transaction } from './sendEip712Transaction.js'

const sourceAccount = accounts[0]

const client = anvilZksync.getClient()

client.request = (async ({ method, params }) => {
  if (method === 'eth_sendRawTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_estimateGas') return 158774n
  return anvilZksync.getClient().request({ method, params } as any)
}) as EIP1193RequestFn

const base: ZksyncTransactionRequestEIP712 = {
  from: '0x0000000000000000000000000000000000000000',
  paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
  paymasterInput:
    '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
}

test('default', async () => {
  expect(
    await sendEip712Transaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...base,
    }),
  ).toMatchInlineSnapshot(
    `"0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87"`,
  )
})

test('behavior: null account', async () => {
  const requests: unknown[] = []
  const url = await createRpcProxy(anvilZksync.rpcUrl.http, (request) => {
    requests.push(request)
    return undefined
  })
  const client = createClient({
    account: privateKeyToAccount(accounts[1].privateKey),
    chain: anvilZksync.chain,
    transport: http(url),
  })

  const hash = await sendEip712Transaction(client, {
    account: null,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    type: 'eip712',
    value: 1n,
  })

  expect(requests).toMatchInlineSnapshot(`
    [
      {
        "id": 1,
        "jsonrpc": "2.0",
        "method": "eth_chainId",
      },
      {
        "id": 2,
        "jsonrpc": "2.0",
        "method": "eth_sendTransaction",
        "params": [
          {
            "eip712Meta": {
              "gasPerPubdata": "0xc350",
            },
            "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
            "type": "0x71",
            "value": "0x1",
          },
        ],
      },
    ]
  `)

  const { from, to, value } = await getTransaction(client, { hash })
  expect({ from, to, value }).toMatchInlineSnapshot(`
    {
      "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      "value": 1n,
    }
  `)
})

test('errors: no account', async () => {
  await expect(() =>
    // @ts-expect-error
    sendEip712Transaction(client, base),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Docs: https://viem.sh/docs/actions/wallet/sendTransaction
    Version: viem@x.y.z]
  `)
})

test('errors: invalid eip712 tx', async () => {
  await expect(() =>
    sendEip712Transaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: Transaction is not an EIP712 transaction.

    Transaction must:
      - include \`type: "eip712"\`
      - include one of the following: \`customSignature\`, \`paymaster\`, \`paymasterInput\`, \`gasPerPubdata\`, \`factoryDeps\`

    Request Arguments:
      chain:  ZKsync Era (Local) (id: 324)
      from:   0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

    Version: viem@x.y.z]
  `)
})
