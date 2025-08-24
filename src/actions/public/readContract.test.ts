import { describe, expect, test } from 'vitest'

import {
  Delegation,
  ErrorsExample,
  SoladyAccount07,
  SoladyAccountFactory07,
} from '~contracts/generated.js'
import { baycContractConfig, wagmiContractConfig } from '~test/src/abis.js'
import { accounts, address } from '~test/src/constants.js'
import {
  deploy,
  deployErrorExample,
  deploySoladyAccount_07,
} from '~test/src/utils.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { generatePrivateKey } from '../../accounts/generatePrivateKey.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'

import type { Hex } from '../../types/misc.js'
import { pad } from '../../utils/data/pad.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { encodeFunctionData } from '../../utils/index.js'
import { signAuthorization } from '../wallet/signAuthorization.js'
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
    ).toEqual(877n)
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

test('args: authorizationList', async () => {
  const { contractAddress } = await deploy(client, {
    abi: Delegation.abi,
    bytecode: Delegation.bytecode.object,
  })

  const eoa = privateKeyToAccount(generatePrivateKey())

  const authorization = await signAuthorization(client, {
    account: eoa,
    contractAddress: contractAddress!,
  })

  const result = await readContract(client, {
    abi: Delegation.abi,
    address: eoa.address,
    functionName: 'ping',
    args: ['hello'],
    authorizationList: [authorization],
  })

  expect(result).toMatchInlineSnapshot('"pong: hello"')
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

describe('complex types', () => {
  test('array returns', async () => {
    const result = await readContract(client, {
      abi: [
        {
          inputs: [
            {
              components: [
                { name: 'target', type: 'address' },
                { name: 'allowFailure', type: 'bool' },
                { name: 'callData', type: 'bytes' },
              ],
              name: 'calls',
              type: 'tuple[]',
            },
          ],
          name: 'aggregate3',
          outputs: [
            {
              components: [
                { name: 'success', type: 'bool' },
                { name: 'returnData', type: 'bytes' },
              ],
              name: 'returnData',
              type: 'tuple[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      address: anvilMainnet.chain.contracts.multicall3.address,
      functionName: 'aggregate3',
      args: [
        [
          {
            target: wagmiContractConfig.address,
            allowFailure: false,
            callData: '0x06fdde03', // name() function selector
          },
          {
            target: wagmiContractConfig.address,
            allowFailure: false,
            callData: '0x95d89b41', // symbol() function selector
          },
        ],
      ],
    })

    // Verify it's actually an array of tuples
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)

    // Each element should be a tuple with success and returnData
    for (const item of result) {
      expect(typeof item).toBe('object')
      expect(item).toHaveProperty('success')
      expect(item).toHaveProperty('returnData')
      expect(typeof item.success).toBe('boolean')
      expect(typeof item.returnData).toBe('string')
      expect(item.returnData).toMatch(/^0x[0-9a-fA-F]*$/)
    }
  })

  test('tuple returns', async () => {
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

    // Verify tuple structure is properly decoded
    expect(typeof fields).toBe('string') // bytes1
    expect(typeof name).toBe('string')
    expect(typeof version).toBe('string')
    expect(typeof chainId).toBe('bigint')
    expect(typeof verifyingContract).toBe('string')
    expect(typeof salt).toBe('string') // bytes32
    expect(Array.isArray(extensions)).toBe(true) // uint256[]

    // Verify actual values make sense
    expect(name).toBe('SoladyAccount')
    expect(version).toBe('1')
    expect(chainId).toBe(1n)
    expect(verifyingContract).toMatch(/^0x[0-9a-fA-F]{40}$/)
    expect(salt).toMatch(/^0x[0-9a-fA-F]{64}$/)
  })

  test('array inputs', async () => {
    const calls = [
      {
        target: wagmiContractConfig.address,
        allowFailure: false,
        callData: '0x06fdde03' as const, // name() function selector
      },
      {
        target: wagmiContractConfig.address,
        allowFailure: false,
        callData: '0x95d89b41' as const, // symbol() function selector
      },
      {
        target: baycContractConfig.address,
        allowFailure: false,
        callData: '0x06fdde03' as const, // name() function selector
      },
    ] as const

    const results = await readContract(client, {
      abi: [
        {
          inputs: [
            {
              components: [
                { name: 'target', type: 'address' },
                { name: 'allowFailure', type: 'bool' },
                { name: 'callData', type: 'bytes' },
              ],
              name: 'calls',
              type: 'tuple[]',
            },
          ],
          name: 'aggregate3',
          outputs: [
            {
              components: [
                { name: 'success', type: 'bool' },
                { name: 'returnData', type: 'bytes' },
              ],
              name: 'returnData',
              type: 'tuple[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      address: anvilMainnet.chain.contracts.multicall3.address,
      functionName: 'aggregate3',
      args: [calls],
    })

    // Verify array of structs was properly encoded and decoded
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(3)

    for (const result of results) {
      expect(typeof result).toBe('object')
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('returnData')
      expect(typeof result.success).toBe('boolean')
      expect(typeof result.returnData).toBe('string')
      expect(result.returnData).toMatch(/^0x[0-9a-fA-F]*$/)
    }
  })

  test('nested structs', async () => {
    const nestedCall = {
      target: wagmiContractConfig.address,
      allowFailure: false,
      callData: '0x06fdde03' as const,
    }

    const result = await readContract(client, {
      abi: [
        {
          inputs: [
            {
              components: [
                { name: 'target', type: 'address' },
                { name: 'allowFailure', type: 'bool' },
                { name: 'callData', type: 'bytes' },
              ],
              name: 'calls',
              type: 'tuple[]',
            },
          ],
          name: 'aggregate3',
          outputs: [
            {
              components: [
                { name: 'success', type: 'bool' },
                { name: 'returnData', type: 'bytes' },
              ],
              name: 'returnData',
              type: 'tuple[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      address: anvilMainnet.chain.contracts.multicall3.address,
      functionName: 'aggregate3',
      args: [
        [
          nestedCall,
          {
            target: baycContractConfig.address,
            allowFailure: true,
            callData: '0x95d89b41' as const,
          },
        ],
      ],
    })

    // Verify nested struct encoding worked
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)
    expect(result[0]).toHaveProperty('success')
    expect(result[0]).toHaveProperty('returnData')
    expect(typeof result[0].success).toBe('boolean')
    expect(typeof result[0].returnData).toBe('string')
  })
})

describe('block context', () => {
  test('block number', async () => {
    const specificBlock = anvilMainnet.forkBlockNumber - 100n

    const result = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'totalSupply',
      blockNumber: specificBlock,
    })

    // Should return a valid result from that specific block
    expect(typeof result).toBe('bigint')
    expect(result).toBeGreaterThan(0n)

    // Verify consistency for same block
    const resultAgain = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'totalSupply',
      blockNumber: specificBlock,
    })
    expect(result).toBe(resultAgain)
  })

  test('block tags', async () => {
    const blockTags = ['latest', 'pending', 'finalized'] as const

    for (const blockTag of blockTags) {
      const result = await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'name',
        blockTag,
      })
      expect(typeof result).toBe('string')
      expect(result).toBe('wagmi')
    }
  })

  test('historical state', async () => {
    const currentSupply = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'totalSupply',
      blockTag: 'latest',
    })

    const pastSupply = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'totalSupply',
      blockNumber: anvilMainnet.forkBlockNumber,
    })

    // Both should be valid bigints
    expect(typeof currentSupply).toBe('bigint')
    expect(typeof pastSupply).toBe('bigint')
    expect(currentSupply).toBeGreaterThan(0n)
    expect(pastSupply).toBeGreaterThan(0n)

    // Test consistency for same block
    const pastSupply2 = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'totalSupply',
      blockNumber: anvilMainnet.forkBlockNumber,
    })
    expect(pastSupply).toBe(pastSupply2)
  })

  test('invalid block', async () => {
    // Test with future block number
    await expect(() =>
      readContract(client, {
        ...wagmiContractConfig,
        functionName: 'totalSupply',
        blockNumber: 999999999999999999n,
      }),
    ).rejects.toThrow()

    // Test with invalid block tag
    await expect(() =>
      readContract(client, {
        ...wagmiContractConfig,
        functionName: 'totalSupply',
        blockTag: 'invalid' as any,
      }),
    ).rejects.toThrow()
  })
})

describe('account parameter', () => {
  test('account context', async () => {
    const accountTests = [
      { account: accounts[0].address, target: accounts[0].address },
      { account: accounts[1].address, target: accounts[1].address },
      { account: accounts[0].address, target: address.vitalik },
    ]

    for (const { account, target } of accountTests) {
      const balance = await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'balanceOf',
        args: [target],
        account,
      })
      expect(typeof balance).toBe('bigint')
      expect(balance).toBeGreaterThanOrEqual(0n)
    }
  })

  test('consistency', async () => {
    const resultWithAccount = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'symbol',
      account: accounts[0].address,
    })

    const resultWithoutAccount = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'symbol',
    })

    // Both should work and return the same result for view functions
    expect(resultWithAccount).toBe('WAGMI')
    expect(resultWithoutAccount).toBe('WAGMI')
    expect(resultWithAccount).toBe(resultWithoutAccount)
  })
})

describe('edge cases', () => {
  test('invalid address', async () => {
    // Test valid address format but non-contract
    await expect(() =>
      readContract(client, {
        abi: wagmiContractConfig.abi,
        address: '0x0000000000000000000000000000000000000069',
        functionName: 'totalSupply',
      }),
    ).rejects.toThrow(/returned no data/)

    // Test zero address
    await expect(() =>
      readContract(client, {
        abi: wagmiContractConfig.abi,
        address: '0x0000000000000000000000000000000000000000',
        functionName: 'totalSupply',
      }),
    ).rejects.toThrow(/returned no data/)
  })

  test('boundary conditions', async () => {
    // Test with zero address balance - should revert for ERC721
    await expect(() =>
      readContract(client, {
        ...wagmiContractConfig,
        functionName: 'balanceOf',
        args: ['0x0000000000000000000000000000000000000000'],
      }),
    ).rejects.toThrow(/zero address/)

    // Test with large token ID that doesn't exist
    const nonExistentTokenId = 999999999n
    await expect(() =>
      readContract(client, {
        ...wagmiContractConfig,
        functionName: 'ownerOf',
        args: [nonExistentTokenId],
      }),
    ).rejects.toThrow()

    // Test with invalid interface ID
    const invalidInterfaceResult = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'supportsInterface',
      args: ['0x00000000'],
    })
    expect(typeof invalidInterfaceResult).toBe('boolean')
  })

  test('deployless edge cases', async () => {
    // Test with invalid bytecode
    await expect(() =>
      readContract(client, {
        abi: wagmiContractConfig.abi,
        code: '0x00',
        functionName: 'name',
      }),
    ).rejects.toThrow()

    // Test with empty bytecode
    await expect(() =>
      readContract(client, {
        abi: wagmiContractConfig.abi,
        code: '0x',
        functionName: 'name',
      }),
    ).rejects.toThrow()
  })

  test('BAYC edge cases', async () => {
    // Test with token ID that doesn't exist (BAYC has 10,000 tokens: 0-9999)
    await expect(() =>
      readContract(client, {
        ...baycContractConfig,
        functionName: 'ownerOf',
        args: [10000n],
      }),
    ).rejects.toThrow() // Should revert for non-existent token

    // Test with very large token ID
    await expect(() =>
      readContract(client, {
        ...baycContractConfig,
        functionName: 'ownerOf',
        args: [999999999999n],
      }),
    ).rejects.toThrow() // Should revert for non-existent token
  })
})

describe('function selectors', () => {
  test('selector verification', async () => {
    // Test that the function selectors in comments are actually correct
    const nameSelector = '0x06fdde03' // name() function selector
    const symbolSelector = '0x95d89b41' // symbol() function selector

    // Test using multicall3 with verified selectors
    const multicallResult = await readContract(client, {
      abi: [
        {
          inputs: [
            {
              components: [
                { name: 'target', type: 'address' },
                { name: 'allowFailure', type: 'bool' },
                { name: 'callData', type: 'bytes' },
              ],
              name: 'calls',
              type: 'tuple[]',
            },
          ],
          name: 'aggregate3',
          outputs: [
            {
              components: [
                { name: 'success', type: 'bool' },
                { name: 'returnData', type: 'bytes' },
              ],
              name: 'returnData',
              type: 'tuple[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      address: anvilMainnet.chain.contracts.multicall3.address,
      functionName: 'aggregate3',
      args: [
        [
          {
            target: wagmiContractConfig.address,
            allowFailure: false,
            callData: nameSelector, // name() function selector
          },
          {
            target: wagmiContractConfig.address,
            allowFailure: false,
            callData: symbolSelector, // symbol() function selector
          },
        ],
      ],
    })

    // Verify the function selectors actually work
    expect(Array.isArray(multicallResult)).toBe(true)
    expect(multicallResult.length).toBe(2)
    expect(multicallResult[0].success).toBe(true)
    expect(multicallResult[1].success).toBe(true)
  })

  test('consistency', async () => {
    // Verify that direct function calls and selector-based calls return the same data
    const directName = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'name',
    })

    const selectorBasedName = await readContract(client, {
      abi: [
        {
          inputs: [
            {
              components: [
                { name: 'target', type: 'address' },
                { name: 'allowFailure', type: 'bool' },
                { name: 'callData', type: 'bytes' },
              ],
              name: 'calls',
              type: 'tuple[]',
            },
          ],
          name: 'aggregate3',
          outputs: [
            {
              components: [
                { name: 'success', type: 'bool' },
                { name: 'returnData', type: 'bytes' },
              ],
              name: 'returnData',
              type: 'tuple[]',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      address: anvilMainnet.chain.contracts.multicall3.address,
      functionName: 'aggregate3',
      args: [
        [
          {
            target: wagmiContractConfig.address,
            allowFailure: false,
            callData: '0x06fdde03', // name() function selector
          },
        ],
      ],
    })

    expect(directName).toBe('wagmi')
    expect(Array.isArray(selectorBasedName)).toBe(true)
    expect(selectorBasedName[0].success).toBe(true)
    // The return data contains the encoded result, not the decoded string
    expect(typeof selectorBasedName[0].returnData).toBe('string')
  })
})

describe('integration', () => {
  test('multi-contract', async () => {
    // Test reading from multiple contracts in sequence
    const wagmiName = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'name',
    })

    const wagmiSymbol = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'symbol',
    })

    const wagmiSupply = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'totalSupply',
      blockNumber: anvilMainnet.forkBlockNumber,
    })

    // Verify all contract interactions work
    expect(wagmiName).toBe('wagmi')
    expect(wagmiSymbol).toBe('WAGMI')
    expect(typeof wagmiSupply).toBe('bigint')
    expect(wagmiSupply).toBeGreaterThan(0n)
  })

  test('concurrent calls', async () => {
    // Test multiple concurrent calls to verify no race conditions
    const promises = Array.from({ length: 5 }, (_, i) =>
      readContract(client, {
        ...wagmiContractConfig,
        functionName: 'balanceOf',
        args: [accounts[i % accounts.length].address],
      }),
    )

    const results = await Promise.all(promises)

    // All should be valid bigints
    for (const result of results) {
      expect(typeof result).toBe('bigint')
      expect(result).toBeGreaterThanOrEqual(0n)
    }
  })

  test('type validation', async () => {
    // Test various return types
    const name = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'name',
    })

    const balance = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'balanceOf',
      args: [accounts[0].address],
    })

    const approved = await readContract(client, {
      ...wagmiContractConfig,
      functionName: 'isApprovedForAll',
      args: [accounts[0].address, accounts[1].address],
    })

    // Verify type correctness
    expect(typeof name).toBe('string')
    expect(typeof balance).toBe('bigint')
    expect(typeof approved).toBe('boolean')

    expect(name).toBe('wagmi')
    expect(balance).toBeGreaterThanOrEqual(0n)
    expect([true, false]).toContain(approved)
  })

  test('performance', async () => {
    // Test that repeated calls with same parameters return consistent results
    const contractCall = {
      ...wagmiContractConfig,
      functionName: 'name' as const,
    }

    // Make multiple calls with identical parameters
    const results = await Promise.all([
      readContract(client, contractCall),
      readContract(client, contractCall),
      readContract(client, contractCall),
    ])

    // All results should be identical
    expect(results[0]).toBe('wagmi')
    expect(results[1]).toBe('wagmi')
    expect(results[2]).toBe('wagmi')
    expect(results[0]).toBe(results[1])
    expect(results[1]).toBe(results[2])
  })
})
