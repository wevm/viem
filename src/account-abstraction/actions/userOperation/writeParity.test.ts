import { Value } from 'ox'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { Actions as CoreActions } from 'viem'
import {
  Actions,
  Client,
  UserOperationExecutionError,
  http,
} from 'viem/account-abstraction'
import * as generated from '~contracts/generated.js'
import { getSmartAccounts_07 } from '~test/account-abstraction.js'
import * as anvil from '~test/anvil.js'
import { bundler } from '~test/bundler.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const executionClient = anvil.getClient(anvil.mainnet)
const rawClient = Client.create({
  pollingInterval: 50,
  transport: http(bundler.rpcUrl.http),
})
const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test
const fees = {
  maxFeePerGas: Value.fromGwei('15'),
  maxPriorityFeePerGas: Value.fromGwei('2'),
} as const

let account: Awaited<ReturnType<typeof getSmartAccounts_07>>[number]
let errorsAddress: Awaited<ReturnType<typeof contract.deploy>>['address']

beforeAll(async () => {
  if (process.env.SKIP_GLOBAL_SETUP) return

  const accounts = await getSmartAccounts_07()
  const account_ = accounts[8]
  if (!account_) throw new Error('Smart Account fixture is required.')
  account = account_

  errorsAddress = (
    await contract.deploy(executionClient, {
      bytecode: generated.ErrorsExample.bytecode.object,
    })
  ).address
}, 60_000)

beforeEach(async () => {
  if (process.env.SKIP_GLOBAL_SETUP) return
  await bundler.restart()
  await rawClient.request({
    method: 'debug_bundler_setBundlingMode',
    params: ['manual'],
  })
})

describe.sequential('fully formed User Operations', () => {
  liveTest(
    'estimates and sends without an attached account',
    { timeout: 30_000 },
    async () => {
      const accountClient = Client.create({
        account,
        client: executionClient,
        transport: http(bundler.rpcUrl.http),
      })
      const calls = [
        {
          to: constants.accounts[6].address,
          value: Value.fromEther('1'),
        },
      ] as const
      const balance = await CoreActions.address.getBalance(executionClient, {
        address: calls[0].to,
      })
      const prepared = await Actions.userOperation.prepare(accountClient, {
        calls,
        ...fees,
      })
      const operation = {
        ...prepared,
        signature: await account.signUserOperation(prepared),
      }

      const gas = await Actions.userOperation.estimateGas(rawClient, {
        ...operation,
        entryPointAddress: account.entryPoint.address,
      })
      const hash = await Actions.userOperation.send(rawClient, {
        ...operation,
        entryPointAddress: account.entryPoint.address,
      })
      const receiptPromise = Actions.userOperation.waitForReceipt<'0.7'>(
        rawClient,
        {
          hash,
          pollingInterval: 50,
          timeout: 15_000,
        },
      )

      await rawClient.request({ method: 'debug_bundler_sendBundleNow' })
      await CoreActions.block.mine(executionClient, { blocks: 1 })
      const receipt = await receiptPromise

      expect({
        callGasLimit: gas.callGasLimit > 0n,
        hash: hash.length === 66,
        included: receipt.success,
        transferred:
          (await CoreActions.address.getBalance(executionClient, {
            address: calls[0].to,
          })) ===
          balance + calls[0].value,
      }).toMatchInlineSnapshot(`
        {
          "callGasLimit": true,
          "hash": true,
          "included": true,
          "transferred": true,
        }
      `)
    },
  )

  liveTest(
    'decodes a custom contract error from a batched estimate',
    { timeout: 30_000 },
    async () => {
      const client = Client.create({
        account,
        client: executionClient,
        transport: http(bundler.rpcUrl.http),
      })
      const error = await Actions.userOperation
        .estimateGas(client, {
          calls: [
            { to: constants.accounts[5].address, value: 1n },
            {
              abi: generated.ErrorsExample.abi,
              functionName: 'simpleCustomWrite',
              to: errorsAddress,
            },
          ],
          ...fees,
        })
        .catch((error) => error)

      if (!(error instanceof UserOperationExecutionError)) throw error
      expect({
        cause: error.cause.name,
        decoded: error.message.includes('SimpleError(string message)'),
        functionName: error.message.includes('simpleCustomWrite'),
        reason: error.message.includes('bugger'),
      }).toMatchInlineSnapshot(`
        {
          "cause": "ContractFunctionExecutionError",
          "decoded": true,
          "functionName": true,
          "reason": true,
        }
      `)
    },
  )
})

test('estimateGas: rejects calls without an account', async () => {
  await expect(
    Actions.userOperation.estimateGas(rawClient, {
      calls: [{ to: constants.accounts[5].address }],
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
      ...fees,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Account.NotFoundError: Could not find an Account to execute with this Action.

    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Version: viem@2.52.1]
  `)
})

test('send: rejects calls without an account', async () => {
  await expect(
    Actions.userOperation.send(rawClient, {
      calls: [{ to: constants.accounts[5].address }],
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
      ...fees,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Account.NotFoundError: Could not find an Account to execute with this Action.

    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Version: viem@2.52.1]
  `)
})
