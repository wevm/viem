import { AbiConstructor, AbiParameters, type Address, Hex, Value } from 'ox'
import { EntryPoint, UserOperation } from 'ox/erc4337'

import { Account, Actions, Client } from 'viem'
import {
  Simple7702Account08,
  SoladyAccount06,
  SoladyAccount07,
  SoladyAccountFactory06,
  SoladyAccountFactory07,
  VerifyingPaymaster07,
  VerifyingPaymaster08,
} from '../../contracts/generated.js'
import * as constants from './constants.js'
import { deploy } from './contract.js'
import { createServer } from './http.js'

/**
 * Spins up a real HTTP server implementing the ERC-7677 paymaster RPC
 * (`pm_getPaymasterStubData` + `pm_getPaymasterData`) backed by a deployed
 * verifying paymaster. Signs with the paymaster's `verifyingSigner`
 * (accounts[0]).
 */
export async function createVerifyingPaymasterServer(
  client: Client.Client,
  options: { paymaster: Address.Address },
) {
  const { paymaster } = options
  const owner = Account.fromPrivateKey(constants.accounts[0].privateKey)

  async function getPaymasterData(
    userOperation: UserOperation.Rpc<'0.7'>,
    context: { validAfter?: number; validUntil?: number } | undefined,
  ) {
    const validUntil = context?.validUntil ?? 3735928559
    const validAfter = context?.validAfter ?? 4660

    const timeRange = AbiParameters.encode(
      [{ type: 'uint48' }, { type: 'uint48' }],
      [validUntil, validAfter],
    )

    const hash = await Actions.contract.read(client, {
      abi: VerifyingPaymaster07.abi,
      address: paymaster,
      args: [
        UserOperation.toPacked(
          // `fromRpc` returns the version/signed-widened union; paymaster
          // RPC requests always carry a (dummy) signature.
          UserOperation.fromRpc({
            ...userOperation,
            paymaster: userOperation.paymaster ?? paymaster,
            paymasterData: userOperation.paymasterData ?? timeRange,
          }) as UserOperation.UserOperation<'0.7', true>,
        ),
        validUntil,
        validAfter,
      ],
      functionName: 'getHash',
    })

    const signature = await owner.signMessage({ message: { raw: hash } })
    return Hex.concat(timeRange, signature)
  }

  return createServer((req, res) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', async () => {
      const { method, params } = JSON.parse(data)

      try {
        if (method === 'pm_getPaymasterStubData') {
          const [userOperation, , , context] = params
          const paymasterData = await getPaymasterData(userOperation, context)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(
            JSON.stringify({
              result: {
                isFinal: false,
                paymaster,
                paymasterData,
                paymasterPostOpGasLimit: Hex.fromNumber(1_000_000n),
                paymasterVerificationGasLimit: Hex.fromNumber(1_000_000n),
                sponsor: { name: 'Viem Sugar Daddy' },
              },
            }),
          )
        }

        if (method === 'pm_getPaymasterData') {
          const [userOperation, , , context] = params
          const paymasterData = await getPaymasterData(userOperation, context)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(
            JSON.stringify({
              result: {
                paymaster,
                paymasterData,
                paymasterPostOpGasLimit: Hex.fromNumber(1_000_000n),
                paymasterVerificationGasLimit: Hex.fromNumber(1_000_000n),
              },
            }),
          )
        }
      } catch {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal server error' }))
      }
    })
  })
}

/** Deploys the ERC-4337 v0.8 Simple7702Account implementation. */
export async function deploySimple7702Account08(client: Client.Client) {
  const { address: implementationAddress } = await deploy(client, {
    bytecode: Simple7702Account08.bytecode.object,
  })
  return { implementationAddress }
}

/** Deploys the Solady (EntryPoint 0.6) account implementation + factory. */
export async function deploySoladyAccount06(client: Client.Client) {
  const { address: implementationAddress } = await deploy(client, {
    bytecode: SoladyAccount06.bytecode.object,
  })
  const { address: factoryAddress } = await deploy(client, {
    bytecode: AbiConstructor.encode(
      AbiConstructor.fromAbi(SoladyAccountFactory06.abi),
      {
        args: [implementationAddress],
        bytecode: SoladyAccountFactory06.bytecode.object,
      },
    ),
  })
  return { factoryAddress, implementationAddress }
}

/** Deploys the Solady (EntryPoint 0.7) account implementation + factory. */
export async function deploySoladyAccount07(client: Client.Client) {
  const { address: implementationAddress } = await deploy(client, {
    bytecode: SoladyAccount07.bytecode.object,
  })
  const { address: factoryAddress } = await deploy(client, {
    bytecode: AbiConstructor.encode(
      AbiConstructor.fromAbi(SoladyAccountFactory07.abi),
      {
        args: [implementationAddress],
        bytecode: SoladyAccountFactory07.bytecode.object,
      },
    ),
  })
  return { factoryAddress, implementationAddress }
}

/** Deploys a funded verifying paymaster against EntryPoint 0.6. */
export async function deployVerifyingPaymaster06(client: Client.Client) {
  return deployVerifyingPaymaster(client, {
    abi: VerifyingPaymaster07.abi,
    bytecode: VerifyingPaymaster07.bytecode.object,
    entryPoint: EntryPoint.addressV06,
  })
}

/** Deploys a funded verifying paymaster against EntryPoint 0.7. */
export async function deployVerifyingPaymaster07(client: Client.Client) {
  return deployVerifyingPaymaster(client, {
    abi: VerifyingPaymaster07.abi,
    bytecode: VerifyingPaymaster07.bytecode.object,
    entryPoint: EntryPoint.addressV07,
  })
}

/** Deploys a funded verifying paymaster against EntryPoint 0.8. */
export async function deployVerifyingPaymaster08(client: Client.Client) {
  return deployVerifyingPaymaster(client, {
    abi: VerifyingPaymaster08.abi,
    bytecode: VerifyingPaymaster08.bytecode.object,
    entryPoint: EntryPoint.addressV08,
  })
}

/** Deploys a verifying paymaster and funds its EntryPoint deposit. @internal */
async function deployVerifyingPaymaster(
  client: Client.Client,
  options: {
    abi: typeof VerifyingPaymaster07.abi | typeof VerifyingPaymaster08.abi
    bytecode: Hex.Hex
    entryPoint: Address.Address
  },
) {
  const { abi, bytecode, entryPoint } = options

  const { address } = await deploy(client, {
    bytecode: AbiConstructor.encode(AbiConstructor.fromAbi(abi), {
      args: [entryPoint, constants.accounts[0].address],
      bytecode,
    }),
  })

  await Actions.contract.write(client, {
    abi,
    account: constants.accounts[9].address,
    address,
    functionName: 'deposit',
    value: Value.fromEther('100'),
  })
  await Actions.test.block.mine(client, { blocks: 1 })

  return address
}
