import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../src/accounts/privateKeyToAccount.js'
import { entryPoint07Abi } from '../../src/account-abstraction/constants/abis.js'
import { entryPoint07Address } from '../../src/account-abstraction/constants/address.js'
import { toPackedUserOperation } from '../../src/account-abstraction/utils/userOperation/toPackedUserOperation.js'
import { estimateFeesPerGas } from '../../src/actions/public/estimateFeesPerGas.js'
import { getCode } from '../../src/actions/public/getCode.js'
import { readContract } from '../../src/actions/public/readContract.js'
import { waitForTransactionReceipt } from '../../src/actions/public/waitForTransactionReceipt.js'
import { writeContract } from '../../src/actions/wallet/writeContract.js'
import { baseSepolia } from '../../src/chains/index.js'
import { createClient } from '../../src/clients/createClient.js'
import { http } from '../../src/clients/transports/http.js'
import { stringToHex } from '../../src/utils/encoding/toHex.js'
import { keccak256 } from '../../src/utils/hash/keccak256.js'
import { parseEther } from '../../src/utils/unit/parseEther.js'
import { toSmartAccount } from '../../src/eip8130/accounts/toSmartAccount.js'
import { getEip8130Deployment } from '../../src/eip8130/deployments.js'
import { key } from '../../src/eip8130/keys.js'

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined
const RPC_URL = process.env.BASE_SEPOLIA_RPC ?? 'https://sepolia.base.org'

describe.runIf(PRIVATE_KEY)(
  'self-bundle: create EIP-8130 account + execute via EntryPoint.handleOps',
  () => {
    test(
      'AccountConfiguration is the factory; deploy + action in a single userOp (no staking)',
      async () => {
        const owner = privateKeyToAccount(PRIVATE_KEY!)
        const client = createClient({
          account: owner,
          chain: baseSepolia,
          transport: http(RPC_URL),
        })
        const deployment = getEip8130Deployment(baseSepolia.id)!

        const userSalt = keccak256(stringToHex(`viem-8130-self-${Date.now()}`))
        const account = await toSmartAccount({
          client,
          owner,
          userSalt,
          initialActors: [key.k1(owner.address)],
          implementation: deployment.accounts.erc4337,
          accountConfigAddress: deployment.accountConfiguration,
        })

        console.log('\n— self-bundled create + execute (Base Sepolia) —')
        console.log('owner / bundler: ', owner.address)
        console.log('smart account:   ', account.address)
        console.log('factory (config):', deployment.accountConfiguration)

        const codeBefore = await getCode(client, { address: account.address })
        expect(codeBefore ?? '0x').toBe('0x')

        // Pre-fund the account's EntryPoint *deposit* so missingAccountFunds = 0.
        // (Avoids the account having to repay prefund mid-validation, which public
        // RPCs mis-simulate during eth_estimateGas.)
        const depositHash = await writeContract(client, {
          abi: entryPoint07Abi,
          address: entryPoint07Address,
          functionName: 'depositTo',
          args: [account.address],
          value: parseEther('0.003'),
          account: owner,
          chain: baseSepolia,
        })
        await waitForTransactionReceipt(client, { hash: depositHash })

        // Build the user operation by hand.
        const { factory, factoryData } = await account.getFactoryArgs()
        const callData = await account.encodeCalls([
          { to: owner.address, value: 0n, data: '0x' },
        ])
        const nonce = await readContract(client, {
          abi: entryPoint07Abi,
          address: entryPoint07Address,
          functionName: 'getNonce',
          args: [account.address, 0n],
        })
        const fees = await estimateFeesPerGas(client)

        const userOperation = {
          sender: account.address,
          nonce,
          factory,
          factoryData,
          callData,
          callGasLimit: 200_000n,
          verificationGasLimit: 1_000_000n,
          preVerificationGas: 100_000n,
          maxFeePerGas: fees.maxFeePerGas,
          maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
        } as const

        const signature = await account.signUserOperation({
          ...userOperation,
          chainId: baseSepolia.id,
        })
        const packed = toPackedUserOperation({ ...userOperation, signature })

        // We are the bundler: submit handleOps directly, collecting the refund.
        const hash = await writeContract(client, {
          abi: entryPoint07Abi,
          address: entryPoint07Address,
          functionName: 'handleOps',
          args: [[packed], owner.address],
          account: owner,
          chain: baseSepolia,
          // Public RPC eth_estimateGas mis-simulates handleOps prefund; set manually.
          gas: 2_000_000n,
        })
        const receipt = await waitForTransactionReceipt(client, { hash })
        console.log(
          'tx:              ',
          `https://sepolia.basescan.org/tx/${receipt.transactionHash}`,
        )
        console.log('status:          ', receipt.status)
        expect(receipt.status).toBe('success')

        // Public RPCs are load-balanced; poll to avoid reading a lagging replica.
        let codeAfter: `0x${string}` | undefined
        for (let i = 0; i < 10; i++) {
          codeAfter = await getCode(client, { address: account.address })
          if (codeAfter && codeAfter !== '0x') break
          await new Promise((r) => setTimeout(r, 1500))
        }
        expect(codeAfter && codeAfter !== '0x').toBeTruthy()
        console.log('account deployed:', !!(codeAfter && codeAfter !== '0x'))
      },
      180_000,
    )
  },
)
