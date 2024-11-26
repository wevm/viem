import { describe, expect, test, vi } from 'vitest'

import {
  BatchCallDelegation,
  ErrorsExample,
  Payable,
} from '~contracts/generated.js'
import { wagmiContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { deploy, deployErrorExample, deployPayable } from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { generatePrivateKey } from '../../accounts/generatePrivateKey.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { optimism } from '../../chains/index.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { walletActions } from '../../clients/decorators/wallet.js'
import { http } from '../../clients/transports/http.js'
import { InvalidInputRpcError } from '../../errors/rpc.js'
import { signAuthorization } from '../../experimental/index.js'
import { decodeEventLog, getAddress, parseEther } from '../../utils/index.js'
import { getBalance } from '../public/getBalance.js'
import { getTransaction } from '../public/getTransaction.js'
import { getTransactionReceipt } from '../public/getTransactionReceipt.js'
import { simulateContract } from '../public/simulateContract.js'
import { mine } from '../test/mine.js'
import { writeContract } from './writeContract.js'

const client = anvilMainnet.getClient().extend(walletActions)
const clientWithAccount = anvilMainnet.getClient({
  account: accounts[0].address,
})

test('default', async () => {
  expect(
    await writeContract(client, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('inferred account', async () => {
  expect(
    await writeContract(clientWithAccount, {
      ...wagmiContractConfig,
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('client chain mismatch', async () => {
  const client = createWalletClient({
    chain: optimism,
    transport: http(anvilMainnet.rpcUrl.http),
  })
  await expect(() =>
    writeContract(client, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – OP Mainnet).

    Current Chain ID:  1
    Expected Chain ID: 10 – OP Mainnet
     
    Request Arguments:
      from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      data:  0x1249c58b
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint()
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/writeContract
    Version: viem@x.y.z]
  `)
})

test('no chain', async () => {
  const client = createWalletClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  await expect(() =>
    // @ts-expect-error
    writeContract(client, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: No chain was provided to the request.
    Please provide a chain with the \`chain\` argument on the Action, or by supplying a \`chain\` to WalletClient.

    Request Arguments:
      from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      data:  0x1249c58b
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint()
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/writeContract
    Version: viem@x.y.z]
  `)
})

describe('args: chain', () => {
  test('default', async () => {
    const client = createWalletClient({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    expect(
      await writeContract(client, {
        ...wagmiContractConfig,
        account: accounts[0].address,
        functionName: 'mint',
        chain: anvilMainnet.chain,
      }),
    ).toBeDefined()
  })

  test('chain mismatch', async () => {
    await expect(() =>
      writeContract(client, {
        ...wagmiContractConfig,
        account: accounts[0].address,
        functionName: 'mint',
        chain: optimism,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – OP Mainnet).

      Current Chain ID:  1
      Expected Chain ID: 10 – OP Mainnet
       
      Request Arguments:
        chain:  OP Mainnet (id: 10)
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:   0x1249c58b
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/writeContract
      Version: viem@x.y.z]
    `)
  })
})

test('args: authorizationList', async () => {
  const authority = privateKeyToAccount(accounts[1].privateKey)
  const recipient = privateKeyToAccount(generatePrivateKey())

  const balance_recipient = await getBalance(client, {
    address: recipient.address,
  })

  const { contractAddress } = await deploy(client, {
    abi: BatchCallDelegation.abi,
    bytecode: BatchCallDelegation.bytecode.object,
  })

  const authorization = await signAuthorization(client, {
    account: authority,
    contractAddress: contractAddress!,
  })

  const hash = await writeContract(client, {
    abi: BatchCallDelegation.abi,
    account: authority,
    address: authority.address,
    authorizationList: [authorization],
    functionName: 'execute',
    args: [
      [
        {
          to: recipient.address,
          data: '0x',
          value: parseEther('1'),
        },
      ],
    ],
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, { hash })
  const log = receipt.logs[0]
  expect(getAddress(log.address)).toBe(authority.address)
  expect(
    decodeEventLog({
      abi: BatchCallDelegation.abi,
      ...log,
    }),
  ).toEqual({
    args: {
      data: '0x',
      to: recipient.address,
      value: parseEther('1'),
    },
    eventName: 'CallEmitted',
  })

  expect(
    await getBalance(client, {
      address: recipient.address,
    }),
  ).toBe(balance_recipient + parseEther('1'))
})

test('args: authorizationList (delegate)', async () => {
  const delegate = privateKeyToAccount(accounts[0].privateKey)
  const authority = privateKeyToAccount(accounts[1].privateKey)
  const recipient = privateKeyToAccount(generatePrivateKey())

  const balance_authority = await getBalance(client, {
    address: authority.address,
  })
  const balance_recipient = await getBalance(client, {
    address: recipient.address,
  })

  const { contractAddress } = await deploy(client, {
    abi: BatchCallDelegation.abi,
    bytecode: BatchCallDelegation.bytecode.object,
  })

  const authorization = await signAuthorization(client, {
    account: authority,
    contractAddress: contractAddress!,
    delegate,
  })

  const hash = await writeContract(client, {
    abi: BatchCallDelegation.abi,
    account: delegate,
    address: authority.address,
    authorizationList: [authorization],
    functionName: 'execute',
    args: [
      [
        {
          to: recipient.address,
          data: '0x',
          value: parseEther('1'),
        },
      ],
    ],
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, { hash })
  const log = receipt.logs[0]
  expect(getAddress(log.address)).toBe(authority.address)
  expect(
    decodeEventLog({
      abi: BatchCallDelegation.abi,
      ...log,
    }),
  ).toEqual({
    args: {
      data: '0x',
      to: recipient.address,
      value: parseEther('1'),
    },
    eventName: 'CallEmitted',
  })

  expect(
    await getBalance(client, {
      address: recipient.address,
    }),
  ).toBe(balance_recipient + parseEther('1'))
  expect(
    await getBalance(client, {
      address: authority.address,
    }),
  ).toBe(balance_authority - parseEther('1'))
})

test('args: dataSuffix', async () => {
  const spy = vi.spyOn(client, 'sendTransaction')
  await writeContract(client, {
    abi: wagmiContractConfig.abi,
    address: wagmiContractConfig.address,
    account: accounts[0].address,
    functionName: 'mint',
    dataSuffix: '0x12345678',
  })
  expect(spy).toHaveBeenCalledWith({
    account: {
      address: accounts[0].address,
      type: 'json-rpc',
    },
    data: '0x1249c58b12345678',
    to: wagmiContractConfig.address,
  })
})

test('args: value', async () => {
  const { contractAddress } = await deployPayable()

  const hash_1 = await writeContract(clientWithAccount, {
    abi: Payable.abi,
    address: contractAddress!,
    functionName: 'pay',
  })
  const hash_2 = await writeContract(clientWithAccount, {
    abi: Payable.abi,
    address: contractAddress!,
    functionName: 'pay',
    value: 1n,
  })

  expect((await getTransaction(client, { hash: hash_1 })).value).toBe(0n)
  expect((await getTransaction(client, { hash: hash_2 })).value).toBe(1n)
})

test('overloaded function', async () => {
  expect(
    await writeContract(client, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
      args: [13371337n],
    }),
  ).toBeDefined()
})

test('w/ simulateContract', async () => {
  const { request } = await simulateContract(client, {
    ...wagmiContractConfig,
    account: accounts[0].address,
    functionName: 'mint',
    args: [],
  })
  expect(await writeContract(client, request)).toBeDefined()

  await mine(client, { blocks: 1 })

  expect(
    await simulateContract(client, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('w/ simulateContract (overloaded)', async () => {
  const { request } = await simulateContract(client, {
    ...wagmiContractConfig,
    account: accounts[0].address,
    functionName: 'mint',
    args: [69421n],
  })
  expect(await writeContract(client, request)).toBeDefined()

  await mine(client, { blocks: 1 })

  await expect(() =>
    simulateContract(client, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
      args: [69421n],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
    Token ID is taken

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint(uint256 tokenId)
      args:          (69421)
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/simulateContract
    Version: viem@x.y.z]
  `)
})

test('w/ simulateContract (args chain mismatch)', async () => {
  const { request } = await simulateContract(client, {
    ...wagmiContractConfig,
    account: accounts[0].address,
    functionName: 'mint',
    args: [],
    chain: optimism,
  })
  await expect(() =>
    writeContract(client, request),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – OP Mainnet).

    Current Chain ID:  1
    Expected Chain ID: 10 – OP Mainnet
     
    Request Arguments:
      chain:  OP Mainnet (id: 10)
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:     0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      data:   0x1249c58b
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint()
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/writeContract
    Version: viem@x.y.z]
  `)
})

test('w/ simulateContract (client chain mismatch)', async () => {
  const client = createWalletClient({
    chain: optimism,
    transport: http(anvilMainnet.rpcUrl.http),
  })
  const { request } = await simulateContract(client, {
    ...wagmiContractConfig,
    account: accounts[0].address,
    functionName: 'mint',
    args: [],
  })
  await expect(() =>
    writeContract(client, request),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – OP Mainnet).

    Current Chain ID:  1
    Expected Chain ID: 10 – OP Mainnet
     
    Request Arguments:
      from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      data:  0x1249c58b
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint()
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/writeContract
    Version: viem@x.y.z]
  `)
})

test('behavior: transport supports `wallet_sendTransaction`', async () => {
  const request = client.request
  client.request = (parameters: any) => {
    if (parameters.method === 'eth_sendTransaction')
      throw new InvalidInputRpcError(new Error())
    return request(parameters)
  }

  expect(
    await writeContract(client, {
      ...wagmiContractConfig,
      account: accounts[0].address,
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('behavior: nullish account', async () => {
  expect(
    await writeContract(client, {
      ...wagmiContractConfig,
      functionName: 'mint',
      account: null,
    }),
  ).toBeDefined()
})

describe('behavior: contract revert', () => {
  test('revert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      writeContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'revertWrite',
        account: privateKeyToAccount(accounts[0].privateKey),
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "revertWrite" reverted with the following reason:
      This is a revert message

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  revertWrite()
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Docs: https://viem.sh/docs/contract/writeContract
      Version: viem@x.y.z]
    `)
  })

  test('assert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      writeContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'assertWrite',
        account: privateKeyToAccount(accounts[0].privateKey),
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "assertWrite" reverted with the following reason:
      An \`assert\` condition failed.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  assertWrite()
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Docs: https://viem.sh/docs/contract/writeContract
      Version: viem@x.y.z]
    `)
  })

  test('overflow', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      writeContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'overflowWrite',
        account: privateKeyToAccount(accounts[0].privateKey),
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "overflowWrite" reverted with the following reason:
      Arithmetic operation resulted in underflow or overflow.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  overflowWrite()
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Docs: https://viem.sh/docs/contract/writeContract
      Version: viem@x.y.z]
    `)
  })

  test('divide by zero', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      writeContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'divideByZeroWrite',
        account: privateKeyToAccount(accounts[0].privateKey),
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "divideByZeroWrite" reverted with the following reason:
      Division or modulo by zero (e.g. \`5 / 0\` or \`23 % 0\`).

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  divideByZeroWrite()
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Docs: https://viem.sh/docs/contract/writeContract
      Version: viem@x.y.z]
    `)
  })

  test('require', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      writeContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'requireWrite',
        account: privateKeyToAccount(accounts[0].privateKey),
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "requireWrite" reverted.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  requireWrite()
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Docs: https://viem.sh/docs/contract/writeContract
      Version: viem@x.y.z]
    `)
  })

  test('custom error: simple', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      writeContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'simpleCustomWrite',
        account: privateKeyToAccount(accounts[0].privateKey),
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "simpleCustomWrite" reverted.

      Error: SimpleError(string message)
                        (bugger)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  simpleCustomWrite()
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Docs: https://viem.sh/docs/contract/writeContract
      Version: viem@x.y.z]
    `)
  })

  test('custom error: complex', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      writeContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'complexCustomWrite',
        account: privateKeyToAccount(accounts[0].privateKey),
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "complexCustomWrite" reverted.

      Error: ComplexError((address sender, uint256 bar), string message, uint256 number)
                         ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  complexCustomWrite()
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Docs: https://viem.sh/docs/contract/writeContract
      Version: viem@x.y.z]
    `)
  })
})
