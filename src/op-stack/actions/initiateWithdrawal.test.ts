import { describe, expect, test } from 'vitest'
import { accounts } from '../../../test/src/constants.js'
import { optimismClient } from '../../../test/src/opStack.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import {
  getTransactionReceipt,
  mine,
  waitForTransactionReceipt,
} from '../../actions/index.js'
import { sepolia } from '../../chains/index.js'
import { http, createClient, decodeEventLog, parseEther } from '../../index.js'
import { l2ToL1MessagePasserAbi } from '../abis.js'
import { optimismSepolia } from '../chains.js'
import { getWithdrawals } from '../utils/getWithdrawals.js'
import { buildInitiateWithdrawal } from './buildInitiateWithdrawal.js'
import { buildProveWithdrawal } from './buildProveWithdrawal.js'
import { finalizeWithdrawal } from './finalizeWithdrawal.js'
import { getGame } from './getGame.js'
import { getTimeToFinalize } from './getTimeToFinalize.js'
import { getTimeToProve } from './getTimeToProve.js'
import { initiateWithdrawal } from './initiateWithdrawal.js'
import { proveWithdrawal } from './proveWithdrawal.js'
import { waitToFinalize } from './waitToFinalize.js'
import { waitToProve } from './waitToProve.js'

test('default', async () => {
  const hash = await initiateWithdrawal(optimismClient, {
    account: accounts[0].address,
    request: {
      data: '0xdeadbeef',
      gas: 21000n,
      to: accounts[0].address,
      value: parseEther('1'),
    },
  })
  expect(hash).toBeDefined()

  await mine(optimismClient, { blocks: 1 })

  const receipt = await getTransactionReceipt(optimismClient, {
    hash,
  })
  expect(receipt).toBeDefined()

  const log = decodeEventLog({
    abi: l2ToL1MessagePasserAbi,
    eventName: 'MessagePassed',
    ...receipt.logs[0],
  })
  const {
    args: { nonce: _, withdrawalHash: __, ...args },
  } = log
  expect(args).toMatchInlineSnapshot(`
    {
      "data": "0xdeadbeef",
      "gasLimit": 21000n,
      "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "target": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "value": 1000000000000000000n,
    }
  `)
})

test('args: gas', async () => {
  const hash = await initiateWithdrawal(optimismClient, {
    account: accounts[0].address,
    request: {
      data: '0xdeadbeef',
      gas: 21000n,
      to: accounts[0].address,
      value: parseEther('1'),
    },
    gas: 420_000n,
  })
  expect(hash).toBeDefined()
})

test('args: gas (nullish)', async () => {
  const hash = await initiateWithdrawal(optimismClient, {
    account: accounts[0].address,
    request: {
      data: '0xdeadbeef',
      gas: 21000n,
      to: accounts[0].address,
      value: parseEther('1'),
    },
    gas: null,
  })
  expect(hash).toBeDefined()
})

test('error: insufficient funds', async () => {
  await expect(() =>
    initiateWithdrawal(optimismClient, {
      account: accounts[0].address,
      request: {
        data: '0xdeadbeef',
        gas: 21000n,
        to: accounts[0].address,
        value: parseEther('20000'),
      },
      gas: 69n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

    This error could arise when the account does not have enough funds to:
     - pay for the total gas fee,
     - pay for the value to send.
     
    The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
     - \`gas\` is the amount of gas needed for transaction to execute,
     - \`gas fee\` is the gas fee,
     - \`value\` is the amount of ether to send to the recipient.
     
    Estimate Gas Arguments:
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:     0x4200000000000000000000000000000000000016
      value:  20000 ETH
      data:   0xc2b3e5ac000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000520800000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000
      gas:    69
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  initiateWithdrawal(address _target, uint256 _gasLimit, bytes _data)
      args:                        (0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 21000, 0xdeadbeef)
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/estimateContractGas
    Details: Insufficient funds for gas * price + value
    Version: viem@1.0.2]
  `)
})

test('error: small gas', async () => {
  await expect(() =>
    initiateWithdrawal(optimismClient, {
      account: accounts[0].address,
      request: {
        data: '0xdeadbeef',
        gas: 21000n,
        to: accounts[0].address,
        value: parseEther('1'),
      },
      gas: 69n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: Transaction creation failed.

    URL: http://localhost
    Request body: {"method":"eth_estimateGas","params":[{"from":"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266","data":"0xc2b3e5ac000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000520800000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000","gas":"0x45","to":"0x4200000000000000000000000000000000000016","value":"0xde0b6b3a7640000"}]}
     
    Estimate Gas Arguments:
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:     0x4200000000000000000000000000000000000016
      value:  1 ETH
      data:   0xc2b3e5ac000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000520800000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000
      gas:    69
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  initiateWithdrawal(address _target, uint256 _gasLimit, bytes _data)
      args:                        (0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 21000, 0xdeadbeef)
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/estimateContractGas
    Details: Out of gas: gas required exceeds allowance: 0x0000000000000000000000000000000000000000000000000000000000000045_U256
    Version: viem@1.0.2]
  `)
})

describe.skip('e2e', () => {
  const account = privateKeyToAccount(
    (process.env.VITE_ACCOUNT_PRIVATE_KEY as `0x${string}`) ||
      accounts[0].privateKey,
  )

  const client_opSepolia = createClient({
    account,
    chain: optimismSepolia,
    transport: http(),
  })
  const client_sepolia = createClient({
    account,
    chain: sepolia,
    transport: http(),
  })

  test('full', async () => {
    const args = await buildInitiateWithdrawal(client_sepolia, {
      to: account.address,
      value: 69n,
    })

    const hash = await initiateWithdrawal(client_opSepolia, args)

    const receipt = await waitForTransactionReceipt(client_opSepolia, {
      hash: hash,
    })

    const proveTime = await getTimeToProve(client_sepolia, {
      receipt: receipt,
      targetChain: client_opSepolia.chain,
    })

    console.log('seconds to prove:', proveTime.seconds)

    const { game, withdrawal } = await waitToProve(client_sepolia, {
      receipt: receipt,
      targetChain: client_opSepolia.chain,
    })

    const proveArgs = await buildProveWithdrawal(client_opSepolia, {
      game,
      withdrawal,
    })

    const proveHash = await proveWithdrawal(client_sepolia, proveArgs)

    await waitForTransactionReceipt(client_sepolia, {
      hash: proveHash,
    })

    const finalizeTime = await getTimeToFinalize(client_sepolia, {
      targetChain: client_opSepolia.chain,
      withdrawalHash: withdrawal.withdrawalHash,
    })

    console.log('seconds to finalize:', finalizeTime.seconds)

    await waitToFinalize(client_sepolia, {
      targetChain: client_opSepolia.chain,
      withdrawalHash: withdrawal.withdrawalHash,
    })

    const finalizeHash = await finalizeWithdrawal(client_sepolia, {
      targetChain: client_opSepolia.chain,
      withdrawal,
    })

    await waitForTransactionReceipt(client_sepolia, {
      hash: finalizeHash,
    })
  }, 1200000)

  test('e2e (prove step)', async () => {
    const receipt = await getTransactionReceipt(client_opSepolia, {
      hash: '0x0cb90819569b229748c16caa26c9991fb8674581824d31dc9339228bb4e77731',
    })

    const [withdrawal] = getWithdrawals(receipt)
    const game = await getGame(client_sepolia, {
      l2BlockNumber: receipt.blockNumber,
      targetChain: client_opSepolia.chain,
      strategy: 'latest',
    })

    const proveArgs = await buildProveWithdrawal(client_opSepolia, {
      game,
      withdrawal,
    })

    const proveHash = await proveWithdrawal(client_sepolia, proveArgs)

    console.log('proveHash', proveHash)
  })
})
