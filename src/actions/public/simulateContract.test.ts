/**
 * TODO:  Heaps more test cases :D
 *        - Complex calldata types
 *        - Complex return types (tuple/structs)
 *        - EIP-1559
 *        - Calls against blocks
 *        - Custom chain types
 *        - Custom nonce
 */
import { describe, expect, test, vi } from 'vitest'

import { ErrorsExample } from '~contracts/generated.js'
import { baycContractConfig, wagmiContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import {
  deployBAYC,
  deployErrorExample,
  mainnetClient,
} from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { publicActions } from '../../clients/decorators/public.js'
import { walletActions } from '../../clients/decorators/wallet.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { mine } from '../test/mine.js'

import { maxUint256 } from '~viem/constants/number.js'
import { simulateContract } from './simulateContract.js'

const client = anvilMainnet
  .getClient()
  .extend(publicActions)
  .extend(walletActions)
const clientWithAccount = anvilMainnet.getClient({
  account: accounts[0].address,
})

describe('wagmi', () => {
  test('default', async () => {
    expect(
      (
        await simulateContract(client, {
          ...wagmiContractConfig,
          account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          functionName: 'mint',
          args: [13371337n],
        })
      ).result,
    ).toEqual(undefined)
    expect(
      (
        await simulateContract(client, {
          ...wagmiContractConfig,
          functionName: 'safeTransferFrom',
          account: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
          args: [
            '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
            '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            1n,
          ],
        })
      ).result,
    ).toEqual(undefined)
  })

  test('overloaded function', async () => {
    expect(
      (
        await simulateContract(client, {
          ...wagmiContractConfig,
          account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          functionName: 'mint',
        })
      ).result,
    ).toEqual(undefined)
  })

  test('client account', async () => {
    const { request, result } = await simulateContract(clientWithAccount, {
      ...wagmiContractConfig,
      functionName: 'mint',
    })
    expect(result).toEqual(undefined)
    expect(request.account).toEqual(clientWithAccount.account)
  })

  test('no account', async () => {
    await expect(() =>
      simulateContract(client, {
        ...wagmiContractConfig,
        functionName: 'mint',
        args: [13371337n],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
      ERC721: mint to the zero address

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (13371337)

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
  })

  test('revert', async () => {
    await expect(() =>
      simulateContract(client, {
        ...wagmiContractConfig,
        functionName: 'approve',
        args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', 420n],
        account: accounts[0].address,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "approve" reverted with the following reason:
      ERC721: approval to current owner

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  approve(address to, uint256 tokenId)
        args:             (0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC, 420)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
    await expect(() =>
      simulateContract(client, {
        ...wagmiContractConfig,
        functionName: 'mint',
        args: [1n],
        account: accounts[0].address,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
      Token ID is taken

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
    await expect(() =>
      simulateContract(client, {
        ...wagmiContractConfig,
        functionName: 'safeTransferFrom',
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        args: [
          '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          1n,
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "safeTransferFrom" reverted with the following reason:
      ERC721: transfer caller is not owner nor approved

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  safeTransferFrom(address from, address to, uint256 tokenId)
        args:                      (0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6, 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC, 1)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
  })
})

test('args: dataSuffix', async () => {
  const spy = vi.spyOn(client, 'call')
  const { request } = await simulateContract(client, {
    abi: wagmiContractConfig.abi,
    address: wagmiContractConfig.address,
    account: accounts[0].address,
    functionName: 'mint',
    dataSuffix: '0x12345678',
  })
  expect(spy).toHaveBeenCalledWith({
    account: request.account,
    batch: false,
    data: '0x1249c58b12345678',
    to: wagmiContractConfig.address,
  })
  expect(request.dataSuffix).toEqual('0x12345678')
})

describe('BAYC', () => {
  describe('default', () => {
    test('mintApe', async () => {
      const { contractAddress } = await deployBAYC()

      // Set sale state to active
      await client.writeContract({
        address: contractAddress!,
        abi: baycContractConfig.abi,
        functionName: 'flipSaleState',
        account: accounts[0].address,
      })
      await mine(client, { blocks: 1 })

      // Mint an Ape!
      expect(
        (
          await simulateContract(client, {
            abi: baycContractConfig.abi,
            address: contractAddress!,
            functionName: 'mintApe',
            account: accounts[0].address,
            args: [1n],
            value: 1000000000000000000n,
          })
        ).result,
      ).toBe(undefined)
    })

    test('reserveApes', async () => {
      const { contractAddress } = await deployBAYC()

      // Reserve apes
      expect(
        (
          await simulateContract(client, {
            abi: baycContractConfig.abi,
            address: contractAddress!,
            functionName: 'reserveApes',
            account: accounts[0].address,
          })
        ).result,
      ).toBe(undefined)
    })
  })

  describe('account hoisting', () => {
    test('no account hoisted', async () => {
      const { contractAddress } = await deployBAYC()

      // Set sale state to active
      await client.writeContract({
        address: contractAddress!,
        abi: baycContractConfig.abi,
        functionName: 'flipSaleState',
        account: accounts[0].address,
      })
      await mine(client, { blocks: 1 })

      // Mint an Ape!
      await expect(
        simulateContract(client, {
          abi: baycContractConfig.abi,
          address: contractAddress!,
          functionName: 'mintApe',
          args: [1n],
          value: 1000000000000000000n,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "mintApe" reverted with the following reason:
        ERC721: mint to the zero address

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  mintApe(uint256 numberOfTokens)
          args:             (1)

        Docs: https://viem.sh/docs/contract/simulateContract
        Version: viem@x.y.z]
      `)
    })

    test('account hoisted', async () => {
      const { contractAddress } = await deployBAYC()

      // Set sale state to active
      await client.writeContract({
        address: contractAddress!,
        abi: baycContractConfig.abi,
        functionName: 'flipSaleState',
        account: accounts[0].address,
      })
      await mine(client, { blocks: 1 })

      // Mint an Ape!
      expect(
        (
          await simulateContract(clientWithAccount, {
            abi: baycContractConfig.abi,
            address: contractAddress!,
            functionName: 'mintApe',
            args: [1n],
            value: 1000000000000000000n,
          })
        ).result,
      ).toBe(undefined)
    })
  })

  describe('revert', () => {
    test('sale inactive', async () => {
      const { contractAddress } = await deployBAYC()

      // Expect mint to fail.
      await expect(() =>
        simulateContract(client, {
          abi: baycContractConfig.abi,
          address: contractAddress!,
          functionName: 'mintApe',
          account: accounts[0].address,
          args: [1n],
          value: 1n,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "mintApe" reverted with the following reason:
        Sale must be active to mint Ape

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  mintApe(uint256 numberOfTokens)
          args:             (1)
          sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

        Docs: https://viem.sh/docs/contract/simulateContract
        Version: viem@x.y.z]
      `)
    })
  })
})

describe('contract errors', () => {
  test('revert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'revertWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "revertWrite" reverted with the following reason:
        This is a revert message

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  revertWrite()
          sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

        Docs: https://viem.sh/docs/contract/simulateContract
        Version: viem@x.y.z]
      `)
  })

  test('assert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'assertWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "assertWrite" reverted with the following reason:
        An \`assert\` condition failed.

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  assertWrite()
          sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

        Docs: https://viem.sh/docs/contract/simulateContract
        Version: viem@x.y.z]
      `)
  })

  test('overflow', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'overflowWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "overflowWrite" reverted with the following reason:
      Arithmetic operation resulted in underflow or overflow.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  overflowWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
  })

  test('divide by zero', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'divideByZeroWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "divideByZeroWrite" reverted with the following reason:
      Division or modulo by zero (e.g. \`5 / 0\` or \`23 % 0\`).

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  divideByZeroWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
  })

  test('require', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'requireWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "requireWrite" reverted.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  requireWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
  })

  test('custom error: simple', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'simpleCustomWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "simpleCustomWrite" reverted.

      Error: SimpleError(string message)
                        (bugger)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  simpleCustomWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
  })

  test('custom error: complex', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'complexCustomWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "complexCustomWrite" reverted.

      Error: ComplexError((address sender, uint256 bar), string message, uint256 number)
                         ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  complexCustomWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
  })
})

test('fake contract address', async () => {
  await expect(() =>
    simulateContract(client, {
      abi: [
        {
          name: 'mint',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [],
          outputs: [{ type: 'uint256' }],
        },
      ],
      address: '0x0000000000000000000000000000000000000069',
      functionName: 'mint',
      account: accounts[0].address,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "mint" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "mint",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint()
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/simulateContract
    Version: viem@x.y.z]
  `)
})

describe('node errors', () => {
  test('fee cap too high', async () => {
    await expect(() =>
      simulateContract(client, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [13371337n],
        maxFeePerGas: maxUint256 + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Raw Call Arguments:
        from:          0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
        to:            0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:          0xa0712d680000000000000000000000000000000000000000000000000000000000cc07c9
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (13371337)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
  })

  // TODO:  Waiting for Anvil fix – should fail with "gas too low" reason
  //        This test will fail when Anvil is fixed.
  test('gas too low', async () => {
    await expect(() =>
      simulateContract(client, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [13371337n],
        gas: 100n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The amount of gas (100) provided for the transaction exceeds the limit allowed for the block.

      Raw Call Arguments:
        from:  0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
        to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:  0xa0712d680000000000000000000000000000000000000000000000000000000000cc07c9
        gas:   100
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (13371337)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract
      Details: intrinsic gas too high -- CallGasCostMoreThanGasLimit
      Version: viem@x.y.z]
    `)

    await expect(() =>
      simulateContract(mainnetClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [13371337n],
        gas: 100n,
      }),
    ).rejects.toThrowError('intrinsic gas too low')
  })

  // TODO:  Waiting for Anvil fix – should fail with "gas too high" reason
  //        This test will fail when Anvil is fixed.
  test('gas too high', async () => {
    expect(
      await simulateContract(client, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [13371337n],
        gas: 100_000_000_000_000_000n,
      }),
    ).toBeDefined()
  })

  // TODO:  Waiting for Anvil fix – should fail with "gas fee less than block base fee" reason
  //        This test will fail when Anvil is fixed.
  test('fee cap too low', async () => {
    expect(
      await simulateContract(client, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [13371337n],
        maxFeePerGas: 1n,
      }),
    ).toBeDefined()

    await expect(() =>
      simulateContract(mainnetClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [13371337n],
        maxFeePerGas: 1n,
      }),
    ).rejects.toThrowError('cannot be lower than the block base fee')
  })

  test.skip('nonce too low', async () => {
    await expect(() =>
      simulateContract(client, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [13371337n],
        nonce: 0,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: Nonce provided for the transaction is lower than the current nonce of the account.
      Try increasing the nonce or find the latest nonce with \`getTransactionCount\`.

      Raw Call Arguments:
        from:   0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
        to:     0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:   0xa0712d680000000000000000000000000000000000000000000000000000000000cc07c9
        nonce:  0
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (13371337)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract
      Details: nonce too low
      Version: viem@x.y.z]
    `)
  })

  test('insufficient funds', async () => {
    await expect(() =>
      simulateContract(client, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [13371337n],
        // @ts-expect-error
        value: parseEther('100000'),
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
       
      Raw Call Arguments:
        from:   0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
        to:     0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        value:  100000 ETH
        data:   0xa0712d680000000000000000000000000000000000000000000000000000000000cc07c9
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (13371337)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract
      Details: Insufficient funds for gas * price + value
      Version: viem@x.y.z]
    `)

    await expect(() =>
      simulateContract(mainnetClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [13371337n],
        // @ts-expect-error
        value: parseEther('100000'),
      }),
    ).rejects.toThrowError('insufficient funds for gas * price + value')
  })

  test('maxFeePerGas less than maxPriorityFeePerGas', async () => {
    await expect(() =>
      simulateContract(client, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [13371337n],
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('22'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The provided tip (\`maxPriorityFeePerGas\` = 22 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 20 gwei).

      Raw Call Arguments:
        from:                  0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
        to:                    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:                  0xa0712d680000000000000000000000000000000000000000000000000000000000cc07c9
        maxFeePerGas:          20 gwei
        maxPriorityFeePerGas:  22 gwei
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (13371337)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@x.y.z]
    `)
  })
})
