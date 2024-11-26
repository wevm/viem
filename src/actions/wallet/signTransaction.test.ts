import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { blobData, kzg } from '../../../test/src/kzg.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { celo, mainnet } from '../../chains/index.js'
import {
  http,
  type TransactionRequestBase,
  type TransactionRequestEIP1559,
  type TransactionRequestEIP2930,
  type TransactionRequestLegacy,
  createWalletClient,
  parseGwei,
  stringToHex,
} from '../../index.js'
import type {
  TransactionRequestEIP4844,
  TransactionRequestEIP7702,
} from '../../types/transaction.js'
import { toBlobs } from '../../utils/blob/toBlobs.js'
import { mine } from '../index.js'
import { prepareTransactionRequest } from './prepareTransactionRequest.js'
import { signTransaction } from './signTransaction.js'

const client = anvilMainnet.getClient()

const sourceAccount = accounts[0]

const base = {
  from: '0x0000000000000000000000000000000000000000',
  gas: 21000n,
  nonce: 785,
} satisfies TransactionRequestBase

describe('eip7702', async () => {
  const authority = privateKeyToAccount(accounts[1].privateKey)
  const authorization = await authority.experimental_signAuthorization({
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 420,
  })

  const baseEip7702 = {
    ...base,
    authorizationList: [authorization],
    to: '0x0000000000000000000000000000000000000000',
    type: 'eip7702',
  } as const satisfies TransactionRequestEIP7702

  // TODO: Anvil does not support sign 7702 over JSON-RPC yet.
  test.todo('default: json-rpc')

  test('default: local', async () => {
    const signature = await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip7702,
    })
    expect(signature).toMatchInlineSnapshot(
      `"0x04f8c40182031180808252089400000000000000000000000000000000000000008080c0f85ef85c0194fba3912ca04dd458c843e2ee08967fc04f3579c28201a480a08d7765afec6e09d93be91a1324f0dbbd6bcb96f4b37e8645a4c65d08a979ab69a070b81c53368b35a58af8630903c57d2b106842f9a081e3dc607c0c0cd990c77d01a0d2e4cf87a02ffd9a6cf0854ff5036b987847c562bf7a5f79fe2d322fba51e3eda002b72b1124ca8c2e43d8895601055cf4af7bf1cd0f757451483cc4dc5cdfb4a3"`,
    )
  })

  test('w/ prepareTransactionRequest', async () => {
    const request = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip7702,
    })
    const signature = await signTransaction(client, request)
    expect(signature).toMatchInlineSnapshot(
      `"0x04f8cd01820311843b9aca008502ae1107ec8252089400000000000000000000000000000000000000008080c0f85ef85c0194fba3912ca04dd458c843e2ee08967fc04f3579c28201a480a08d7765afec6e09d93be91a1324f0dbbd6bcb96f4b37e8645a4c65d08a979ab69a070b81c53368b35a58af8630903c57d2b106842f9a081e3dc607c0c0cd990c77d01a00c0d98a5aa820287d07cd20b5b05a1a5c19f50ff3b0e700c795313522515a21fa00450425c5f5a9b6862d9c1f9513b6254d38391eee7d3147f67f9b7bb6d3b94c2"`,
    )
  })
})

describe('eip4844', () => {
  const baseEip4844 = {
    ...base,
    blobs: toBlobs({ data: stringToHex(blobData) }),
    kzg,
    maxFeePerBlobGas: parseGwei('20'),
    to: '0x0000000000000000000000000000000000000000',
    type: 'eip4844',
  } as const satisfies TransactionRequestEIP4844

  test.todo('default: json-rpc')

  test('default: local', async () => {
    const signature = await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip4844,
    })
    expect(signature).toMatchSnapshot()
  })

  test('w/ prepareTransactionRequest', async () => {
    const request = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip4844,
    })
    const signature = await signTransaction(client, request)
    expect(signature).toMatchSnapshot()
  })
})

describe('eip1559', () => {
  const baseEip1559 = {
    ...base,
    type: 'eip1559',
  } as const satisfies TransactionRequestEIP1559

  test('default: json-rpc', async () => {
    const signature = await signTransaction(client, {
      account: sourceAccount.address,
      ...baseEip1559,
    })
    expect(signature).toMatchInlineSnapshot(
      `"0x02f855018203118085023fcf074c825208808080c080a0377bbfa08e94c5e78aecb79096d2198c1493cb2f1947052c437e1f976cb2dbe4a017ce1425a8efbe51ff2e283bec62522824b2ebdaa503ce22409699097300458c"`,
    )
  })

  test('default: local', async () => {
    const signature = await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip1559,
    })
    expect(signature).toMatchInlineSnapshot(
      '"0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33"',
    )
  })

  test('w/ prepareTransactionRequest', async () => {
    await mine(client, { blocks: 1 })

    const request_1 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      value: 1n,
    })
    const signature_1 = await signTransaction(client, request_1)
    expect(signature_1.match(/^0x02/)).toBeTruthy()

    await mine(client, { blocks: 1 })

    const request_2 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      maxFeePerGas: parseGwei('30'),
      value: 1n,
    })
    const signature_2 = await signTransaction(client, request_2)
    expect(signature_2.match(/^0x02/)).toBeTruthy()
  })

  describe('minimal', () => {
    test('default (local)', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          type: 'eip1559',
        }),
      ).toMatchInlineSnapshot(
        '"0x02f84c0180808080808080c001a0db5b8a12b90b68aeb786379ac14219ac85934e833082dee6cf03fd912809224da06902cc208e3b14a056dca2005c96f59eae33118b899f642551a58cff09044c9a"',
      )
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          chain: mainnet,
          type: 'eip1559',
        }),
      ).toMatchInlineSnapshot(
        '"0x02f84c0180808080808080c001a0db5b8a12b90b68aeb786379ac14219ac85934e833082dee6cf03fd912809224da06902cc208e3b14a056dca2005c96f59eae33118b899f642551a58cff09044c9a"',
      )
    })

    test('w/ maxFeePerGas (local)', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          maxFeePerGas: parseGwei('2'),
        }),
      ).toMatchInlineSnapshot(
        '"0x02f850018080847735940080808080c001a09926ae69535547075ec96eb3b7a9dd658ea58defa9c93a76e5a93288f3ce1d33a020baea54c020452a789fa0a0ea9c7249e25163929193ca5f8861f4e70935e631"',
      )
    })

    test('w/ type (local)', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          type: 'eip1559',
        }),
      ).toMatchInlineSnapshot(
        '"0x02f84c0180808080808080c001a0db5b8a12b90b68aeb786379ac14219ac85934e833082dee6cf03fd912809224da06902cc208e3b14a056dca2005c96f59eae33118b899f642551a58cff09044c9a"',
      )
    })
  })

  describe('args', () => {
    test('accessList (local)', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          ...baseEip1559,
          accessList: [
            {
              address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
              storageKeys: [
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
              ],
            },
          ],
        }),
      ).toMatchInlineSnapshot(
        '"0x02f8ac018203118080825208808080f85bf85994f39fd6e51aad88f6f4ce6ab8827279cfffb92266f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe80a0df4810a25d0e147163b03e392bf083dc852702715b9ba848eb9821c70ce2c92ea00b6d11209ef326abaf83aa2443ba61851c7c8ca0813e347a04b501f584b03024"',
      )
    })

    test('data (local)', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          ...baseEip1559,
          data: '0x1234',
        }),
      ).toMatchInlineSnapshot(
        '"0x02f8520182031180808252088080821234c001a054d552c58a162c9003633c20871d8e381ef7a3c35d1c8a79c7c12d5cf09a0914a03c5d6241f8c4fcf8b35262de038d3ab1940feb1a70b934ae5d40ea6bce912e2d"',
      )
    })

    test('maxFeePerGas/maxPriorityFeePerGas', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          ...baseEip1559,
          maxFeePerGas: parseGwei('20'),
          maxPriorityFeePerGas: parseGwei('2'),
        }),
      ).toMatchInlineSnapshot(
        '"0x02f8590182031184773594008504a817c800825208808080c001a06ea33b188b30a5f5d0d1cec62b2bac7203ff428a49048766596727737689043fa0255b74c8e704e3692497a29cd246ffc4344b4107457ce1c914fe2b4e09993859"',
      )
    })
  })
})

describe('eip2930', () => {
  const baseEip2930 = {
    ...base,
    type: 'eip2930',
  } as const satisfies TransactionRequestEIP2930

  test.skip('default: json-rpc', async () => {
    const signature = await signTransaction(client, {
      account: sourceAccount.address,
      ...baseEip2930,
    })
    expect(signature).toMatchInlineSnapshot(
      '"0x01f84f0182031180825208808080c080a089cebce5c7f728febd1060b55837c894ec2a79dd7854350abce252fc2de96b5da039f2782c70b92f4b1916aa8db91453c7229f33458bd091b3e10a40f9a7e443d2"',
    )
  })

  test('default: local', async () => {
    const signature = await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip2930,
    })
    expect(signature).toMatchInlineSnapshot(
      '"0x01f84f0182031180825208808080c080a089cebce5c7f728febd1060b55837c894ec2a79dd7854350abce252fc2de96b5da039f2782c70b92f4b1916aa8db91453c7229f33458bd091b3e10a40f9a7e443d2"',
    )
  })

  test('w/ prepareTransactionRequest', async () => {
    await mine(client, { blocks: 1 })
    const request = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      value: 1n,
      type: 'eip2930',
    })

    const signature = await signTransaction(client, request)
    expect(signature.match(/^0x01/)).toBeTruthy()
  })

  describe('minimal', () => {
    test('w/ type (local)', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          type: 'eip2930',
        }),
      ).toMatchInlineSnapshot(
        '"0x01f84b01808080808080c080a0cfac15d0507fbcdff8c8b489a85704f856f0b0803cacbbe9aa2a0fd34fd9c260a0571039b719e1c24b410bd6407b22539817c385d99dd9e07858fc973704564d5c"',
      )
    })
  })

  describe('args', () => {
    test('accessList (local)', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          ...baseEip2930,
          accessList: [
            {
              address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
              storageKeys: [
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
              ],
            },
          ],
        }),
      ).toMatchInlineSnapshot(
        '"0x01f8ab0182031180825208808080f85bf85994f39fd6e51aad88f6f4ce6ab8827279cfffb92266f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe01a041dbfa79cb11e5049b7c64e29c8484a2b43e664dcaea31ba1f2c9887c62f76b7a002964169f5c366e21a440c006a06f121eca1aafa2275d7c1f165891eb3d31e54"',
      )
    })

    test('data (local)', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          ...baseEip2930,
          data: '0x1234',
        }),
      ).toMatchInlineSnapshot(
        '"0x01f85101820311808252088080821234c080a084fdcea5fe55ce8378aa94a8d4a9c01545d59922f1edcdd89a71ebf740dc0bf5a0539a4ab61a42509a6b4c35c85099d8b7b8e815967f0c832c868327caca6307cb"',
      )
    })

    test('gasPrice (local)', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          ...baseEip2930,
          gasPrice: parseGwei('20'),
        }),
      ).toMatchInlineSnapshot(
        '"0x01f854018203118504a817c800825208808080c080a058e29913bc928a79e0536fc588e8fe372464d1ff4feff691c344c0163280c97ea037780b5c99301a67aaacfbe98c83139fd026e30925fc103b7898b53af9cb0658"',
      )
    })
  })
})

describe('legacy', () => {
  const baseLegacy = {
    ...base,
    gasPrice: parseGwei('2'),
    type: 'legacy',
  } as const satisfies TransactionRequestLegacy

  test('default', async () => {
    expect(
      await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        ...baseLegacy,
      }),
    ).toMatchInlineSnapshot(
      '"0xf851820311847735940082520880808025a0c1dc31893c8b13bc2dca5e650f68373ea0b8f3c182b516453faf217c53123527a0353f95bc1dab45198fde8cd20c597cb83ea7cf5a6d49586f0c2eaf150356aa49"',
    )
  })

  test('w/ prepareTransactionRequest', async () => {
    await mine(client, { blocks: 1 })
    const request = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      value: 1n,
      type: 'legacy',
    })
    const signature = await signTransaction(client, request)
    expect(signature.match(/^0xf8/)).toBeTruthy()
  })

  describe('minimal', () => {
    test('w/ type', async () => {
      expect(
        await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          type: 'legacy',
        }),
      ).toMatchInlineSnapshot(
        '"0xf84980808080808026a0ea35a1957cb3b2df609b111365df2bc937dfb054f18e4eaa0d0d74c0aa17de21a04aeb73911649e88c65b3b47581731ba1a0e2f810175823f9565da0d54ee45f16"',
      )
    })

    describe('args', () => {
      test('data', async () => {
        expect(
          await signTransaction(client, {
            account: privateKeyToAccount(sourceAccount.privateKey),
            ...baseLegacy,
            data: '0x1234',
          }),
        ).toMatchInlineSnapshot(
          '"0xf8538203118477359400825208808082123425a0d2c01222db75967c3c0e6e24898bf2123e567b693a2e8c469aba19be0e72403ea0119701066fc18f95dc1c54d0fff88d2eb5883e861341b7b5115db0ae1439969f"',
        )
      })

      test('gas', async () => {
        expect(
          await signTransaction(client, {
            account: privateKeyToAccount(sourceAccount.privateKey),
            ...baseLegacy,
            gas: 21000n,
          }),
        ).toMatchInlineSnapshot(
          '"0xf851820311847735940082520880808025a0c1dc31893c8b13bc2dca5e650f68373ea0b8f3c182b516453faf217c53123527a0353f95bc1dab45198fde8cd20c597cb83ea7cf5a6d49586f0c2eaf150356aa49"',
        )
      })

      test('gasPrice', async () => {
        expect(
          await signTransaction(client, {
            account: privateKeyToAccount(sourceAccount.privateKey),
            ...baseLegacy,
            gasPrice: parseGwei('20'),
          }),
        ).toMatchInlineSnapshot(
          '"0xf8518203118504a817c800825208808080259f672886c0db7d3a2710b5bb8b64fd516ff4fede94f34e76b22f451e5ff92ecfa0627283bbafb0600cd997c8dbfa6f4173c5376e2c4c57967541e171fb110b6d64"',
        )
      })
    })
  })
})

describe('custom (cip64)', () => {
  const client = createWalletClient({
    chain: celo,
    transport: http(anvilMainnet.rpcUrl.http),
  })

  test('default', async () => {
    expect(
      await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: null,
        ...base,
        feeCurrency: '0x765de816845861e75a25fca122bb6898b8b1282a',
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('2'),
      }),
    ).toMatchInlineSnapshot(
      '"0x7bf86e0182031184773594008504a817c800825208808080c094765de816845861e75a25fca122bb6898b8b1282a01a0ea3e86b0fd53ada619406822e96cf0dcec1e73b7a8bba60ad355fc8a8f4780e0a0399581f2dbfacab4d301a42e8773f6db217630e861b7d56ccbd333d553a6bb9c"',
    )
  })
})

describe('errors', () => {
  test('no account', async () => {
    await expect(() =>
      // @ts-expect-error
      signTransaction(client, {
        type: 'eip1559',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountNotFoundError: Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Docs: https://viem.sh/docs/actions/wallet/signTransaction
      Version: viem@x.y.z]
    `)
  })
})
