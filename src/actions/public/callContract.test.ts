/**
 * TODO:  Heaps more test cases :D
 *        - Complex calldata types
 *        - Complex return types (tuple/structs)
 *        - EIP-1559
 *        - Calls against blocks
 *        - Custom chain types
 *        - Custom nonce
 */

import { describe, expect, test } from 'vitest'
import {
  accounts,
  publicClient,
  testClient,
  wagmiContractConfig,
  walletClient,
} from '../../../test'
import { baycContractConfig } from '../../../test/abis'
import { BaseError } from '../../errors'
import { encodeFunctionData, getContractError } from '../../utils'
import { mine } from '../test'
import { sendTransaction } from '../wallet'

import { callContract } from './callContract'
import { deployContract } from './deployContract'
import { getTransactionReceipt } from './getTransactionReceipt'

describe('wagmi', () => {
  test('default', async () => {
    expect(
      await callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'isApprovedForAll',
        args: [
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        ],
      }),
    ).toEqual(false)
    expect(
      await callContract(publicClient, {
        ...wagmiContractConfig,
        from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69420n],
      }),
    ).toEqual(undefined)
    expect(
      await callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'name',
      }),
    ).toEqual('wagmi')
    expect(
      await callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'ownerOf',
        args: [1n],
      }),
    ).toEqual('0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6')
    expect(
      await callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'safeTransferFrom',
        from: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
        args: [
          '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          1n,
        ],
      }),
    ).toEqual(undefined)
    expect(
      await callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'tokenURI',
        args: [1n],
      }),
    ).toEqual(
      'data:application/json;base64,eyJuYW1lIjogIndhZ21pICMxIiwgImltYWdlIjogImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaUlIZHBaSFJvUFNJeE1ESTBJaUJvWldsbmFIUTlJakV3TWpRaUlHWnBiR3c5SW01dmJtVWlQanh3WVhSb0lHWnBiR3c5SW1oemJDZ3hPVFlzSURFd01DVXNJREV3SlNraUlHUTlJazB3SURCb01UQXlOSFl4TURJMFNEQjZJaUF2UGp4bklHWnBiR3c5SW1oemJDZzBOQ3dnTVRBd0pTd2dPVEFsS1NJK1BIQmhkR2dnWkQwaVRUa3dNeUEwTXpjdU5XTXdJRGt1TVRFekxUY3VNemc0SURFMkxqVXRNVFl1TlNBeE5pNDFjeTB4Tmk0MUxUY3VNemczTFRFMkxqVXRNVFl1TlNBM0xqTTRPQzB4Tmk0MUlERTJMalV0TVRZdU5TQXhOaTQxSURjdU16ZzNJREUyTGpVZ01UWXVOWHBOTmprNExqVXlPU0ExTmpaak5pNDVNakVnTUNBeE1pNDFNeTAxTGpVNU5pQXhNaTQxTXkweE1pNDFkaTAxTUdNd0xUWXVPVEEwSURVdU5qQTVMVEV5TGpVZ01USXVOVEk1TFRFeUxqVm9NalV1TURVNVl6WXVPVElnTUNBeE1pNDFNamtnTlM0MU9UWWdNVEl1TlRJNUlERXlMalYyTlRCak1DQTJMamt3TkNBMUxqWXdPU0F4TWk0MUlERXlMalV6SURFeUxqVnpNVEl1TlRJNUxUVXVOVGsySURFeUxqVXlPUzB4TWk0MWRpMDFNR013TFRZdU9UQTBJRFV1TmpBNUxURXlMalVnTVRJdU5UTXRNVEl1TldneU5TNHdOVGxqTmk0NU1pQXdJREV5TGpVeU9TQTFMalU1TmlBeE1pNDFNamtnTVRJdU5YWTFNR013SURZdU9UQTBJRFV1TmpBNUlERXlMalVnTVRJdU5USTVJREV5TGpWb016Y3VOVGc1WXpZdU9USWdNQ0F4TWk0MU1qa3ROUzQxT1RZZ01USXVOVEk1TFRFeUxqVjJMVGMxWXpBdE5pNDVNRFF0TlM0Mk1Ea3RNVEl1TlMweE1pNDFNamt0TVRJdU5YTXRNVEl1TlRNZ05TNDFPVFl0TVRJdU5UTWdNVEl1TlhZMU5pNHlOV0UyTGpJMk5DQTJMakkyTkNBd0lERWdNUzB4TWk0MU1qa2dNRlkwTnpndU5XTXdMVFl1T1RBMExUVXVOakE1TFRFeUxqVXRNVEl1TlRNdE1USXVOVWcyT1RndU5USTVZeTAyTGpreUlEQXRNVEl1TlRJNUlEVXVOVGsyTFRFeUxqVXlPU0F4TWk0MWRqYzFZekFnTmk0NU1EUWdOUzQyTURrZ01USXVOU0F4TWk0MU1qa2dNVEl1TlhvaUlDOCtQSEJoZEdnZ1pEMGlUVEUxTnk0Mk5UVWdOVFF4WXkwMkxqa3pNaUF3TFRFeUxqVTFNaTAxTGpVNU5pMHhNaTQxTlRJdE1USXVOWFl0TlRCak1DMDJMamt3TkMwMUxqWXhPUzB4TWk0MUxURXlMalUxTVMweE1pNDFVekV5TUNBME56RXVOVGsySURFeU1DQTBOemd1TlhZM05XTXdJRFl1T1RBMElEVXVOaklnTVRJdU5TQXhNaTQxTlRJZ01USXVOV2d4TlRBdU5qSmpOaTQ1TXpNZ01DQXhNaTQxTlRJdE5TNDFPVFlnTVRJdU5UVXlMVEV5TGpWMkxUVXdZekF0Tmk0NU1EUWdOUzQyTVRrdE1USXVOU0F4TWk0MU5USXRNVEl1TldneE5EUXVNelExWXpNdU5EWTFJREFnTmk0eU56WWdNaTQzT1RnZ05pNHlOellnTmk0eU5YTXRNaTQ0TVRFZ05pNHlOUzAyTGpJM05pQTJMakkxU0RNeU1DNDRNamhqTFRZdU9UTXpJREF0TVRJdU5UVXlJRFV1TlRrMkxURXlMalUxTWlBeE1pNDFkak0zTGpWak1DQTJMamt3TkNBMUxqWXhPU0F4TWk0MUlERXlMalUxTWlBeE1pNDFhREUxTUM0Mk1tTTJMamt6TXlBd0lERXlMalUxTWkwMUxqVTVOaUF4TWk0MU5USXRNVEl1TlhZdE56VmpNQzAyTGprd05DMDFMall4T1MweE1pNDFMVEV5TGpVMU1pMHhNaTQxU0RJNE15NHhOekpqTFRZdU9UTXlJREF0TVRJdU5UVXhJRFV1TlRrMkxURXlMalUxTVNBeE1pNDFkalV3WXpBZ05pNDVNRFF0TlM0Mk1Ua2dNVEl1TlMweE1pNDFOVElnTVRJdU5XZ3RNalV1TVRBell5MDJMamt6TXlBd0xURXlMalUxTWkwMUxqVTVOaTB4TWk0MU5USXRNVEl1TlhZdE5UQmpNQzAyTGprd05DMDFMall5TFRFeUxqVXRNVEl1TlRVeUxURXlMalZ6TFRFeUxqVTFNaUExTGpVNU5pMHhNaTQxTlRJZ01USXVOWFkxTUdNd0lEWXVPVEEwTFRVdU5qRTVJREV5TGpVdE1USXVOVFV4SURFeUxqVm9MVEkxTGpFd05IcHRNekF4TGpJME1pMDJMakkxWXpBZ015NDBOVEl0TWk0NE1URWdOaTR5TlMwMkxqSTNOaUEyTGpJMVNETXpPUzQyTlRWakxUTXVORFkxSURBdE5pNHlOell0TWk0M09UZ3ROaTR5TnpZdE5pNHlOWE15TGpneE1TMDJMakkxSURZdU1qYzJMVFl1TWpWb01URXlMamsyTm1NekxqUTJOU0F3SURZdU1qYzJJREl1TnprNElEWXVNamMySURZdU1qVjZUVFE1TnlBMU5UTXVPREU0WXpBZ05pNDVNamtnTlM0Mk1qZ2dNVEl1TlRRMklERXlMalUzTVNBeE1pNDFORFpvTVRNeVlUWXVNamdnTmk0eU9DQXdJREFnTVNBMkxqSTROaUEyTGpJM01pQTJMakk0SURZdU1qZ2dNQ0F3SURFdE5pNHlPRFlnTmk0eU56Tm9MVEV6TW1NdE5pNDVORE1nTUMweE1pNDFOekVnTlM0Mk1UWXRNVEl1TlRjeElERXlMalUwTmtFeE1pNDFOaUF4TWk0MU5pQXdJREFnTUNBMU1Ea3VOVGN4SURZd05HZ3hOVEF1T0RVNFl6WXVPVFF6SURBZ01USXVOVGN4TFRVdU5qRTJJREV5TGpVM01TMHhNaTQxTkRWMkxURXhNaTQ1TVdNd0xUWXVPVEk0TFRVdU5qSTRMVEV5TGpVME5TMHhNaTQxTnpFdE1USXVOVFExU0RVd09TNDFOekZqTFRZdU9UUXpJREF0TVRJdU5UY3hJRFV1TmpFM0xURXlMalUzTVNBeE1pNDFORFYyTnpVdU1qY3plbTB6Tnk0M01UUXROakl1TnpJM1l5MDJMamswTXlBd0xURXlMalUzTVNBMUxqWXhOeTB4TWk0MU56RWdNVEl1TlRRMWRqSTFMakE1TVdNd0lEWXVPVEk1SURVdU5qSTRJREV5TGpVME5pQXhNaTQxTnpFZ01USXVOVFEyYURFd01DNDFOekpqTmk0NU5ETWdNQ0F4TWk0MU56RXROUzQyTVRjZ01USXVOVGN4TFRFeUxqVTBObll0TWpVdU1Ea3hZekF0Tmk0NU1qZ3ROUzQyTWpndE1USXVOVFExTFRFeUxqVTNNUzB4TWk0MU5EVklOVE0wTGpjeE5Ib2lJR1pwYkd3dGNuVnNaVDBpWlhabGJtOWtaQ0lnTHo0OEwyYytQQzl6ZG1jKyJ9',
    )
    expect(
      await callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'getApproved',
        args: [420n],
      }),
    ).toEqual('0x0000000000000000000000000000000000000000')
    expect(
      await callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'totalSupply',
      }),
    ).toEqual(558n)
    expect(
      await callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'balanceOf',
        args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
      }),
    ).toEqual(3n)
  })

  test('revert', async () => {
    await expect(() =>
      callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'balanceOf',
        args: ['0x0000000000000000000000000000000000000000'],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "ERC721: balance query for the zero address
       
      Contract:  0x0000000000000000000000000000000000000000
      Function:  balanceOf(address owner)
      Arguments:          (0x0000000000000000000000000000000000000000)

      Details: execution reverted: ERC721: balance query for the zero address
      Version: viem@1.0.2"
    `)
    await expect(() =>
      callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'approve',
        args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', 420n],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "ERC721: approval to current owner
       
      Contract:  0x0000000000000000000000000000000000000000
      Function:  approve(address to, uint256 tokenId)
      Arguments:        (0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC, 420)

      Details: execution reverted: ERC721: approval to current owner
      Version: viem@1.0.2"
    `)
    await expect(() =>
      callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'mint',
        args: [1n],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Token ID is taken
       
      Contract:  0x0000000000000000000000000000000000000000
      Function:  mint(uint256 tokenId)
      Arguments:     (1)

      Details: execution reverted: Token ID is taken
      Version: viem@1.0.2"
    `)
    await expect(() =>
      callContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'safeTransferFrom',
        from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        args: [
          '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          1n,
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "ERC721: transfer caller is not owner nor approved
       
      Sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
      Contract:  0x0000000000000000000000000000000000000000
      Function:  safeTransferFrom(address from, address to, uint256 tokenId)
      Arguments:                 (0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6, 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC, 1)

      Details: execution reverted: ERC721: transfer caller is not owner nor approved
      Version: viem@1.0.2"
    `)
  })
})

describe('BAYC', () => {
  describe('default', () => {
    test('mintApe', async () => {
      const { contractAddress } = await deployBAYC()

      // Set sale state to active
      // TODO: replace w/ writeContract
      await sendTransaction(walletClient, {
        data: encodeFunctionData({
          abi: baycContractConfig.abi,
          functionName: 'flipSaleState',
        }),
        from: accounts[0].address,
        to: contractAddress!,
      })
      await mine(testClient, { blocks: 1 })

      // Mint an Ape!
      expect(
        await callContract(publicClient, {
          abi: baycContractConfig.abi,
          address: contractAddress!,
          functionName: 'mintApe',
          from: accounts[0].address,
          args: [1n],
          value: 1000000000000000000n,
        }),
      ).toBe(undefined)
    })

    test('get a free $100k', async () => {
      const { contractAddress } = await deployBAYC()

      // Reserve apes
      expect(
        await callContract(publicClient, {
          abi: baycContractConfig.abi,
          address: contractAddress!,
          functionName: 'reserveApes',
          from: accounts[0].address,
        }),
      ).toBe(undefined)
    })
  })

  describe('revert', () => {
    test('sale inactive', async () => {
      const { contractAddress } = await deployBAYC()

      // Expect mint to fail.
      await expect(() =>
        callContract(publicClient, {
          abi: baycContractConfig.abi,
          address: contractAddress!,
          functionName: 'mintApe',
          from: accounts[0].address,
          args: [1n],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        "Sale must be active to mint Ape
         
        Sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        Contract:  0x0000000000000000000000000000000000000000
        Function:  mintApe(uint256 numberOfTokens)
        Arguments:        (1)

        Details: execution reverted: Sale must be active to mint Ape
        Version: viem@1.0.2"
      `)
    })
  })
})

test('fake contract address', async () => {
  await expect(() =>
    callContract(publicClient, {
      ...wagmiContractConfig,
      address: '0x0000000000000000000000000000000000000069',
      functionName: 'name',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "The contract method \\"name\\" returned no data (\\"0x\\"). This could be due to any of the following:
    - The contract does not have the function \\"name\\",
    - The parameters passed to the contract function may be invalid, or
    - The address is not a contract.
     
    Contract: 0x0000000000000000000000000000000000000000
    Function: name()
            > \\"0x\\"

    Version: viem@1.0.2"
  `)
})

// Deploy BAYC Contract
async function deployBAYC() {
  const hash = await deployContract(walletClient, {
    ...baycContractConfig,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
    from: accounts[0].address,
  })
  await mine(testClient, { blocks: 1 })
  const { contractAddress } = await getTransactionReceipt(publicClient, {
    hash,
  })
  return { contractAddress }
}
