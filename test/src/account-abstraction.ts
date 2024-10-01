import { VerifyingPaymaster } from '../../contracts/generated.js'
import {
  entryPoint06Abi,
  entryPoint07Address,
  formatUserOperation,
  toPackedUserOperation,
  toSoladySmartAccount,
} from '../../src/account-abstraction/index.js'
import {
  mine,
  readContract,
  sendTransaction,
  signMessage,
  writeContract,
} from '../../src/actions/index.js'
import { entryPoint06Address } from '../../src/constants/address.js'
import {
  type Account,
  type Address,
  type Chain,
  type Client,
  type RpcUserOperation,
  type Transport,
  concat,
  encodeAbiParameters,
  numberToHex,
  parseEther,
} from '../../src/index.js'
import { anvilMainnet } from './anvil.js'
import { accounts } from './constants.js'
import {
  createHttpServer,
  deploy,
  deploySoladyAccount_06,
  deploySoladyAccount_07,
} from './utils.js'

const client = anvilMainnet.getClient({ account: true })

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

export async function getVerifyingPaymaster_07() {
  const { contractAddress } = await deploy(client, {
    abi: VerifyingPaymaster.abi,
    bytecode: VerifyingPaymaster.bytecode.object,
    args: [entryPoint07Address, client.account.address],
  })

  await writeContract(client, {
    account: accounts[9].address,
    abi: VerifyingPaymaster.abi,
    address: contractAddress!,
    functionName: 'deposit',
    value: parseEther('100'),
  })
  await mine(client, { blocks: 1 })

  return contractAddress!
}

export async function getVerifyingPaymaster_06() {
  const { contractAddress } = await deploy(client, {
    abi: VerifyingPaymaster.abi,
    bytecode: VerifyingPaymaster.bytecode.object,
    args: [entryPoint06Address, client.account.address],
  })

  await writeContract(client, {
    account: accounts[9].address,
    abi: VerifyingPaymaster.abi,
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
      abi: VerifyingPaymaster.abi,
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
      } catch {
        res.writeHead(500, {
          'Content-Type': 'application/json',
        })
        res.end(JSON.stringify({ error: 'Internal server error' }))
      }
    })
  })
}
