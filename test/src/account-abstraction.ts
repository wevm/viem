import {
  VerifyingPaymaster_07,
  VerifyingPaymaster_08,
} from '../../contracts/generated.js'
import {
  entryPoint06Abi,
  entryPoint06Address,
  entryPoint07Address,
  entryPoint08Address,
  formatUserOperation,
  toPackedUserOperation,
  toSimple7702SmartAccount,
  toSoladySmartAccount,
} from '../../src/account-abstraction/index.js'
import { privateKeyToAccount } from '../../src/accounts/privateKeyToAccount.js'
import {
  mine,
  readContract,
  sendTransaction,
  signMessage,
  writeContract,
} from '../../src/actions/index.js'
import {
  type Account,
  type Address,
  type Chain,
  type Client,
  concat,
  encodeAbiParameters,
  numberToHex,
  parseEther,
  type RpcUserOperation,
  type Transport,
} from '../../src/index.js'
// biome-ignore lint/correctness/noUnusedImports: required for inference.
import type * as _ from '../../src/node_modules/abitype/dist/types/abi.js'
import { anvilMainnet } from './anvil.js'
import { accounts } from './constants.js'
import {
  createHttpServer,
  deploy,
  deploySimple7702Account_08,
  deploySoladyAccount_06,
  deploySoladyAccount_07,
} from './utils.js'

const client = anvilMainnet.getClient({ account: true })

export async function getSmartAccounts_08() {
  const { implementationAddress } = await deploySimple7702Account_08()

  const accounts_ = []

  for (const account of accounts) {
    const owner = privateKeyToAccount(account.privateKey)
    const account_ = await toSimple7702SmartAccount({
      client,
      implementation: implementationAddress,
      owner,
    })
    await sendTransaction(client, {
      account: accounts[9].address,
      to: account_.address,
      value: parseEther('100'),
    })
    accounts_.push(account_)
  }

  await mine(client, {
    blocks: 1,
  })

  return accounts_
}

export async function getSmartAccounts_07() {
  const { factoryAddress } = await deploySoladyAccount_07()

  const accounts_ = []

  for (const salt of [
    '0x0',
    '0x1',
    '0x2',
    '0x3',
    '0x4',
    '0x5',
    '0x6',
    '0x7',
    '0x8',
    '0x9',
  ] as const) {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[0].address,
      salt,
    })
    await sendTransaction(client, {
      account: accounts[9].address,
      to: account.address,
      value: parseEther('100'),
    })
    accounts_.push(account)
  }

  await mine(client, {
    blocks: 1,
  })

  return accounts_
}

export async function getSmartAccounts_06() {
  const { factoryAddress } = await deploySoladyAccount_06()

  const accounts_ = []

  for (const salt of [
    '0x0',
    '0x1',
    '0x2',
    '0x3',
    '0x4',
    '0x5',
    '0x6',
    '0x7',
    '0x8',
    '0x9',
  ] as const) {
    const account = await toSoladySmartAccount({
      client,
      entryPoint: {
        abi: entryPoint06Abi,
        address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        version: '0.6',
      },
      factoryAddress,
      owner: accounts[0].address,
      salt,
    })
    await sendTransaction(client, {
      account: accounts[9].address,
      to: account.address,
      value: parseEther('100'),
    })
    accounts_.push(account)
  }

  await mine(client, {
    blocks: 1,
  })

  return accounts_
}

export async function getVerifyingPaymaster_08() {
  const { contractAddress } = await deploy(client, {
    abi: VerifyingPaymaster_08.abi,
    bytecode: VerifyingPaymaster_08.bytecode.object,
    args: [entryPoint08Address, client.account.address],
  })

  await writeContract(client, {
    account: accounts[9].address,
    abi: VerifyingPaymaster_08.abi,
    address: contractAddress!,
    functionName: 'deposit',
    value: parseEther('100'),
  })
  await mine(client, { blocks: 1 })

  return contractAddress!
}

export async function getVerifyingPaymaster_07() {
  const { contractAddress } = await deploy(client, {
    abi: VerifyingPaymaster_07.abi,
    bytecode: VerifyingPaymaster_07.bytecode.object,
    args: [entryPoint07Address, client.account.address],
  })

  await writeContract(client, {
    account: accounts[9].address,
    abi: VerifyingPaymaster_07.abi,
    address: contractAddress!,
    functionName: 'deposit',
    value: parseEther('100'),
  })
  await mine(client, { blocks: 1 })

  return contractAddress!
}

export async function getVerifyingPaymaster_06() {
  const { contractAddress } = await deploy(client, {
    abi: VerifyingPaymaster_07.abi,
    bytecode: VerifyingPaymaster_07.bytecode.object,
    args: [entryPoint06Address, client.account.address],
  })

  await writeContract(client, {
    account: accounts[9].address,
    abi: VerifyingPaymaster_07.abi,
    address: contractAddress!,
    functionName: 'deposit',
    value: parseEther('100'),
  })
  await mine(client, { blocks: 1 })

  return contractAddress!
}

export async function createVerifyingPaymasterServer(
  client: Client<Transport, Chain | undefined, Account>,
  { paymaster }: { paymaster: Address },
) {
  async function getPaymasterData(
    userOperation: RpcUserOperation<'0.7'>,
    context: any,
  ) {
    const validUntil = context?.validUntil ?? 3735928559
    const validAfter = context?.validAfter ?? 4660

    const hash = await readContract(client, {
      abi: VerifyingPaymaster_07.abi,
      address: paymaster,
      functionName: 'getHash',
      args: [
        toPackedUserOperation(
          formatUserOperation({
            ...userOperation,
            paymaster: userOperation.paymaster ?? paymaster,
            paymasterData:
              userOperation.paymasterData ??
              encodeAbiParameters(
                [{ type: 'uint48' }, { type: 'uint48' }],
                [validUntil, validAfter],
              ),
          }),
        ),
        validUntil,
        validAfter,
      ],
    })

    const signature = await signMessage(client, {
      message: {
        raw: hash,
      },
    })
    const paymasterData = concat([
      encodeAbiParameters(
        [{ type: 'uint48' }, { type: 'uint48' }],
        [validUntil, validAfter],
      ),
      signature,
    ])
    return paymasterData
  }

  return await createHttpServer((req, res) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', async () => {
      const { method, params } = JSON.parse(data)

      try {
        if (method === 'pm_getPaymasterStubData') {
          const [userOperation, _, __, context] = params

          const paymasterData = await getPaymasterData(userOperation, context)

          res.writeHead(200, {
            'Content-Type': 'application/json',
          })
          res.end(
            JSON.stringify({
              result: {
                paymaster,
                paymasterData,
                paymasterPostOpGasLimit: numberToHex(1_000_000n),
                paymasterVerificationGasLimit: numberToHex(1_000_000n),
                isFinal: false,
                sponsor: { name: 'Viem Sugar Daddy' },
              },
            }),
          )
        }

        if (method === 'pm_getPaymasterData') {
          const [userOperation, _, __, context] = params

          const paymasterData = await getPaymasterData(userOperation, context)

          res.writeHead(200, {
            'Content-Type': 'application/json',
          })
          res.end(
            JSON.stringify({
              result: {
                paymaster,
                paymasterData,
                paymasterPostOpGasLimit: numberToHex(1_000_000n),
                paymasterVerificationGasLimit: numberToHex(1_000_000n),
              },
            }),
          )
        }
      } catch (_err) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ error: 'Internal server error' }))
      }
    })
  })
}
