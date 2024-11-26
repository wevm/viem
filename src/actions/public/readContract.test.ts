/**
 * TODO:  Heaps more test cases :D
 *        - Complex calldata types
 *        - Complex return types (tuple/structs)
 *        - Calls against blocks
 */
import { describe, expect, test } from 'vitest'

import {
  ErrorsExample,
  SoladyAccount07,
  SoladyAccountFactory07,
} from '~contracts/generated.js'
import { baycContractConfig, wagmiContractConfig } from '~test/src/abis.js'
import { accounts, address } from '~test/src/constants.js'
import { deployErrorExample, deploySoladyAccount_07 } from '~test/src/utils.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import type { Hex } from '../../types/misc.js'
import { pad } from '../../utils/data/pad.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { encodeFunctionData } from '../../utils/index.js'
import { readContract } from './readContract.js'

const client = anvilMainnet.getClient()

describe('wagmi', () => {
  test('default', async () => {
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'balanceOf',
        args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
      }),
    ).toEqual(4n)
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'getApproved',
        args: [420n],
      }),
    ).toEqual('0x0000000000000000000000000000000000000000')
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'isApprovedForAll',
        args: [
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          '0x0000000000000000000000000000000000000000',
        ],
      }),
    ).toEqual(false)
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'name',
      }),
    ).toEqual('wagmi')
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'ownerOf',
        args: [420n],
      }),
    ).toEqual('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC')
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'supportsInterface',
        args: ['0x1a452251'],
      }),
    ).toEqual(false)
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'symbol',
      }),
    ).toEqual('WAGMI')
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'tokenURI',
        args: [420n],
      }),
    ).toMatchInlineSnapshot(
      '"data:application/json;base64,eyJuYW1lIjogIndhZ21pICM0MjAiLCAiaW1hZ2UiOiAiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhkcFpIUm9QU0l4TURJMElpQm9aV2xuYUhROUlqRXdNalFpSUdacGJHdzlJbTV2Ym1VaVBqeHdZWFJvSUdacGJHdzlJbWh6YkNneE1UY3NJREV3TUNVc0lERXdKU2tpSUdROUlrMHdJREJvTVRBeU5IWXhNREkwU0RCNklpQXZQanhuSUdacGJHdzlJbWh6YkNneU9EZ3NJREV3TUNVc0lEa3dKU2tpUGp4d1lYUm9JR1E5SWswNU1ETWdORE0zTGpWak1DQTVMakV4TXkwM0xqTTRPQ0F4Tmk0MUxURTJMalVnTVRZdU5YTXRNVFl1TlMwM0xqTTROeTB4Tmk0MUxURTJMalVnTnk0ek9EZ3RNVFl1TlNBeE5pNDFMVEUyTGpVZ01UWXVOU0EzTGpNNE55QXhOaTQxSURFMkxqVjZUVFk1T0M0MU1qa2dOVFkyWXpZdU9USXhJREFnTVRJdU5UTXROUzQxT1RZZ01USXVOVE10TVRJdU5YWXROVEJqTUMwMkxqa3dOQ0ExTGpZd09TMHhNaTQxSURFeUxqVXlPUzB4TWk0MWFESTFMakExT1dNMkxqa3lJREFnTVRJdU5USTVJRFV1TlRrMklERXlMalV5T1NBeE1pNDFkalV3WXpBZ05pNDVNRFFnTlM0Mk1Ea2dNVEl1TlNBeE1pNDFNeUF4TWk0MWN6RXlMalV5T1MwMUxqVTVOaUF4TWk0MU1qa3RNVEl1TlhZdE5UQmpNQzAyTGprd05DQTFMall3T1MweE1pNDFJREV5TGpVekxURXlMalZvTWpVdU1EVTVZell1T1RJZ01DQXhNaTQxTWprZ05TNDFPVFlnTVRJdU5USTVJREV5TGpWMk5UQmpNQ0EyTGprd05DQTFMall3T1NBeE1pNDFJREV5TGpVeU9TQXhNaTQxYURNM0xqVTRPV00yTGpreUlEQWdNVEl1TlRJNUxUVXVOVGsySURFeUxqVXlPUzB4TWk0MWRpMDNOV013TFRZdU9UQTBMVFV1TmpBNUxURXlMalV0TVRJdU5USTVMVEV5TGpWekxURXlMalV6SURVdU5UazJMVEV5TGpVeklERXlMalYyTlRZdU1qVmhOaTR5TmpRZ05pNHlOalFnTUNBeElERXRNVEl1TlRJNUlEQldORGM0TGpWak1DMDJMamt3TkMwMUxqWXdPUzB4TWk0MUxURXlMalV6TFRFeUxqVklOams0TGpVeU9XTXROaTQ1TWlBd0xURXlMalV5T1NBMUxqVTVOaTB4TWk0MU1qa2dNVEl1TlhZM05XTXdJRFl1T1RBMElEVXVOakE1SURFeUxqVWdNVEl1TlRJNUlERXlMalY2SWlBdlBqeHdZWFJvSUdROUlrMHhOVGN1TmpVMUlEVTBNV010Tmk0NU16SWdNQzB4TWk0MU5USXROUzQxT1RZdE1USXVOVFV5TFRFeUxqVjJMVFV3WXpBdE5pNDVNRFF0TlM0Mk1Ua3RNVEl1TlMweE1pNDFOVEV0TVRJdU5WTXhNakFnTkRjeExqVTVOaUF4TWpBZ05EYzRMalYyTnpWak1DQTJMamt3TkNBMUxqWXlJREV5TGpVZ01USXVOVFV5SURFeUxqVm9NVFV3TGpZeVl6WXVPVE16SURBZ01USXVOVFV5TFRVdU5UazJJREV5TGpVMU1pMHhNaTQxZGkwMU1HTXdMVFl1T1RBMElEVXVOakU1TFRFeUxqVWdNVEl1TlRVeUxURXlMalZvTVRRMExqTTBOV016TGpRMk5TQXdJRFl1TWpjMklESXVOems0SURZdU1qYzJJRFl1TWpWekxUSXVPREV4SURZdU1qVXROaTR5TnpZZ05pNHlOVWd6TWpBdU9ESTRZeTAyTGprek15QXdMVEV5TGpVMU1pQTFMalU1TmkweE1pNDFOVElnTVRJdU5YWXpOeTQxWXpBZ05pNDVNRFFnTlM0Mk1Ua2dNVEl1TlNBeE1pNDFOVElnTVRJdU5XZ3hOVEF1TmpKak5pNDVNek1nTUNBeE1pNDFOVEl0TlM0MU9UWWdNVEl1TlRVeUxURXlMalYyTFRjMVl6QXROaTQ1TURRdE5TNDJNVGt0TVRJdU5TMHhNaTQxTlRJdE1USXVOVWd5T0RNdU1UY3lZeTAyTGprek1pQXdMVEV5TGpVMU1TQTFMalU1TmkweE1pNDFOVEVnTVRJdU5YWTFNR013SURZdU9UQTBMVFV1TmpFNUlERXlMalV0TVRJdU5UVXlJREV5TGpWb0xUSTFMakV3TTJNdE5pNDVNek1nTUMweE1pNDFOVEl0TlM0MU9UWXRNVEl1TlRVeUxURXlMalYyTFRVd1l6QXROaTQ1TURRdE5TNDJNaTB4TWk0MUxURXlMalUxTWkweE1pNDFjeTB4TWk0MU5USWdOUzQxT1RZdE1USXVOVFV5SURFeUxqVjJOVEJqTUNBMkxqa3dOQzAxTGpZeE9TQXhNaTQxTFRFeUxqVTFNU0F4TWk0MWFDMHlOUzR4TURSNmJUTXdNUzR5TkRJdE5pNHlOV013SURNdU5EVXlMVEl1T0RFeElEWXVNalV0Tmk0eU56WWdOaTR5TlVnek16a3VOalUxWXkwekxqUTJOU0F3TFRZdU1qYzJMVEl1TnprNExUWXVNamMyTFRZdU1qVnpNaTQ0TVRFdE5pNHlOU0EyTGpJM05pMDJMakkxYURFeE1pNDVOalpqTXk0ME5qVWdNQ0EyTGpJM05pQXlMamM1T0NBMkxqSTNOaUEyTGpJMWVrMDBPVGNnTlRVekxqZ3hPR013SURZdU9USTVJRFV1TmpJNElERXlMalUwTmlBeE1pNDFOekVnTVRJdU5UUTJhREV6TW1FMkxqSTRJRFl1TWpnZ01DQXdJREVnTmk0eU9EWWdOaTR5TnpJZ05pNHlPQ0EyTGpJNElEQWdNQ0F4TFRZdU1qZzJJRFl1TWpjemFDMHhNekpqTFRZdU9UUXpJREF0TVRJdU5UY3hJRFV1TmpFMkxURXlMalUzTVNBeE1pNDFORFpCTVRJdU5UWWdNVEl1TlRZZ01DQXdJREFnTlRBNUxqVTNNU0EyTURSb01UVXdMamcxT0dNMkxqazBNeUF3SURFeUxqVTNNUzAxTGpZeE5pQXhNaTQxTnpFdE1USXVOVFExZGkweE1USXVPVEZqTUMwMkxqa3lPQzAxTGpZeU9DMHhNaTQxTkRVdE1USXVOVGN4TFRFeUxqVTBOVWcxTURrdU5UY3hZeTAyTGprME15QXdMVEV5TGpVM01TQTFMall4TnkweE1pNDFOekVnTVRJdU5UUTFkamMxTGpJM00zcHRNemN1TnpFMExUWXlMamN5TjJNdE5pNDVORE1nTUMweE1pNDFOekVnTlM0Mk1UY3RNVEl1TlRjeElERXlMalUwTlhZeU5TNHdPVEZqTUNBMkxqa3lPU0ExTGpZeU9DQXhNaTQxTkRZZ01USXVOVGN4SURFeUxqVTBObWd4TURBdU5UY3lZell1T1RReklEQWdNVEl1TlRjeExUVXVOakUzSURFeUxqVTNNUzB4TWk0MU5EWjJMVEkxTGpBNU1XTXdMVFl1T1RJNExUVXVOakk0TFRFeUxqVTBOUzB4TWk0MU56RXRNVEl1TlRRMVNEVXpOQzQzTVRSNklpQm1hV3hzTFhKMWJHVTlJbVYyWlc1dlpHUWlJQzgrUEM5blBqd3ZjM1puUGc9PSJ9"',
    )
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        blockNumber: anvilMainnet.forkBlockNumber,
        functionName: 'totalSupply',
      }),
    ).toEqual(648n)
  })

  test('overloaded function', async () => {
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        abi: [
          {
            inputs: [{ type: 'uint256', name: 'x' }],
            name: 'balanceOf',
            outputs: [{ type: 'address', name: 'x' }],
            stateMutability: 'pure',
            type: 'function',
          },
          ...wagmiContractConfig.abi,
        ],
        functionName: 'balanceOf',
        args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
      }),
    ).toEqual(4n)
  })

  test('args: stateOverride', async () => {
    const fakeName = 'NotWagmi'

    // layout of strings in storage
    const nameSlot = toHex(0, { size: 32 })
    const fakeNameHex = toHex(fakeName)
    // we don't divide by 2 because length must be length * 2 if word is strictly less than 32 bytes
    const bytesLen = fakeNameHex.length - 2

    expect(bytesLen).toBeLessThanOrEqual(62)

    const slotValue = `${pad(fakeNameHex, { dir: 'right', size: 31 })}${toHex(
      bytesLen,
      { size: 1 },
    ).slice(2)}` as Hex

    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'name',
        stateOverride: [
          {
            address: wagmiContractConfig.address,
            stateDiff: [
              {
                slot: nameSlot,
                value: slotValue,
              },
            ],
          },
        ],
      }),
    ).toEqual(fakeName)
  })
})

describe('bayc', () => {
  test('revert', async () => {
    await expect(() =>
      readContract(client, {
        ...baycContractConfig,
        functionName: 'tokenOfOwnerByIndex',
        args: [address.vitalik, 5n],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "tokenOfOwnerByIndex" reverted with the following reason:
      EnumerableSet: index out of bounds

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  tokenOfOwnerByIndex(address owner, uint256 index)
        args:                         (0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 5)

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })

  test('revert', async () => {
    await expect(() =>
      readContract(client, {
        ...baycContractConfig,
        functionName: 'ownerOf',
        args: [420213123123n],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "ownerOf" reverted with the following reason:
      ERC721: owner query for nonexistent token

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  ownerOf(uint256 tokenId)
        args:             (420213123123)

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })
})

describe('deployless read (factory)', () => {
  test('default', async () => {
    const { factoryAddress: factory } = await deploySoladyAccount_07()

    const address = await readContract(client, {
      account: accounts[0].address,
      abi: SoladyAccountFactory07.abi,
      address: factory,
      functionName: 'getAddress',
      args: [pad('0x0')],
    })
    const factoryData = encodeFunctionData({
      abi: SoladyAccountFactory07.abi,
      functionName: 'createAccount',
      args: [accounts[0].address, pad('0x0')],
    })

    const [
      fields,
      name,
      version,
      chainId,
      verifyingContract,
      salt,
      extensions,
    ] = await readContract(client, {
      address,
      abi: SoladyAccount07.abi,
      functionName: 'eip712Domain',
      factory,
      factoryData,
    })
    expect(verifyingContract).toBeDefined()
    expect([
      fields,
      name,
      version,
      chainId,
      salt,
      extensions,
    ]).toMatchInlineSnapshot(`
      [
        "0x0f",
        "SoladyAccount",
        "1",
        1n,
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        [],
      ]
    `)
  })
})

describe('deployless read (bytecode)', () => {
  test('default', async () => {
    const result = await readContract(client, {
      abi: wagmiContractConfig.abi,
      code: wagmiContractConfig.bytecode,
      functionName: 'name',
    })
    expect(result).toMatchInlineSnapshot(`"wagmi"`)
  })
})

describe('contract errors', () => {
  test('revert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      readContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'revertRead',
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "revertRead" reverted with the following reason:
      This is a revert message

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  revertRead()

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })

  test('assert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      readContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'assertRead',
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "assertRead" reverted with the following reason:
      An \`assert\` condition failed.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  assertRead()

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })

  test('overflow', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      readContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'overflowRead',
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "overflowRead" reverted with the following reason:
      Arithmetic operation resulted in underflow or overflow.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  overflowRead()

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })

  test('divide by zero', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      readContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'divideByZeroRead',
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "divideByZeroRead" reverted with the following reason:
      Division or modulo by zero (e.g. \`5 / 0\` or \`23 % 0\`).

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  divideByZeroRead()

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })

  test('require', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      readContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'requireRead',
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "requireRead" reverted.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  requireRead()

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })

  test('custom error: simple', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      readContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'simpleCustomRead',
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "simpleCustomRead" reverted.

      Error: SimpleError(string message)
                        (bugger)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  simpleCustomRead()

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })

  test('custom error: simple (no args)', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      readContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'simpleCustomReadNoArgs',
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "simpleCustomReadNoArgs" reverted.

      Error: SimpleErrorNoArgs()
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  simpleCustomReadNoArgs()

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })

  test('custom error: complex', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      readContract(client, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'complexCustomRead',
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "complexCustomRead" reverted.

      Error: ComplexError((address sender, uint256 bar), string message, uint256 number)
                         ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  complexCustomRead()

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@x.y.z]
    `)
  })

  test('custom error does not exist on abi', async () => {
    const { contractAddress } = await deployErrorExample()

    const abi = ErrorsExample.abi.filter(
      (abiItem) => abiItem.name !== 'SimpleError',
    )

    await expect(() =>
      readContract(client, {
        abi,
        address: contractAddress!,
        functionName: 'simpleCustomRead',
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "simpleCustomRead" reverted with the following signature:
      0xf9006398

      Unable to decode signature "0xf9006398" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0xf9006398.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  simpleCustomRead()

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@x.y.z]
    `)
  })
})

test('fake contract address', async () => {
  await expect(() =>
    readContract(client, {
      abi: wagmiContractConfig.abi,
      address: '0x0000000000000000000000000000000000000069',
      functionName: 'totalSupply',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "totalSupply" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "totalSupply",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  totalSupply()

    Docs: https://viem.sh/docs/contract/readContract
    Version: viem@x.y.z]
  `)
})
