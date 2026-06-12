import { describe, expect, test } from 'vitest'
import { getUserOperationHash } from './getUserOperationHash.js'

describe('entryPoint: 0.8', () => {
  test('default', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
        entryPointVersion: '0.8',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xa2224e732a1d4e2f923c7c05d586a0aa6cbc42172ec02f31d35fa9a2b8ba9208"`,
    )
  })

  test('args: factory + factoryData', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
        entryPointVersion: '0.8',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          factory: '0x1234567890123456789012345678901234567890',
          factoryData: '0xdeadbeef',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x3146c70a9ef7538e9b9aca8b00ad4b127ca7eef7817a557f1801acbf8d68c206"`,
    )
  })

  test('args: paymaster', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
        entryPointVersion: '0.8',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x364bff8f9104a3854dce4f61f8479ce3019a3bd23e1c8db4da0d7c22850835b9"`,
    )
  })

  test('args: paymasterVerificationGasLimit', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
        entryPointVersion: '0.8',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x9cb735eb4278caf0a9f53ad81e5f592e965c9d034f6e2780befa4cd09a990b04"`,
    )
  })

  test('args: paymasterPostOpGasLimit', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
        entryPointVersion: '0.8',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x745602113988c3a6f18215d96eecc85775998dcb190e374a0955e637d40fe018"`,
    )
  })

  test('args: paymasterData', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
        entryPointVersion: '0.8',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
          paymasterData: '0xdeadbeef',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xf10ef9afcf27a4fd17e477cd19f37e588e3ff7d48eade07ab5b7eb8caf75667f"`,
    )
  })

  test('args: authorization', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
        entryPointVersion: '0.8',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
          paymasterData: '0xdeadbeef',
          factory: '0x7702',
          factoryData: '0xdeadbeef',
          authorization: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 1,
            nonce: 0,
            yParity: 0,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xd96232eb5d02f483166b9b23dca3ec2b963d70f09b961fce348c51d306278462"`,
    )

    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
        entryPointVersion: '0.8',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
          paymasterData: '0xdeadbeef',
          factory: '0x7702',
          authorization: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 1,
            nonce: 0,
            yParity: 0,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x66fe6eaaaf1d6727d404384354a720cb24694c697bfbab77b3d02345c2d6e1da"`,
    )
  })
})

describe('entryPoint: 0.9', () => {
  test('default', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x433709009B8330FDa32311DF1C2AFA402eD8D009',
        entryPointVersion: '0.9',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x5fea5504ddf594de3c1164430244ca36b8f8272d9ae391660be481a2c066fdf3"`,
    )
  })

  test('args: factory + factoryData', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x433709009B8330FDa32311DF1C2AFA402eD8D009',
        entryPointVersion: '0.9',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          factory: '0x1234567890123456789012345678901234567890',
          factoryData: '0xdeadbeef',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x73f57975f825911aa8a5c883b5df235c6b6d50a196f7f52de40d5bca3c8558ae"`,
    )
  })

  test('args: paymaster', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x433709009B8330FDa32311DF1C2AFA402eD8D009',
        entryPointVersion: '0.9',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x61123074468024bd8c8f864f1999f972353816fe66d3041ea832cf4d04420f81"`,
    )
  })

  test('args: paymasterVerificationGasLimit', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x433709009B8330FDa32311DF1C2AFA402eD8D009',
        entryPointVersion: '0.9',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xc2af022040ee744ac33783a7985ee34fe3cf56a412ed65deea5b5a244866ebd5"`,
    )
  })

  test('args: paymasterPostOpGasLimit', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x433709009B8330FDa32311DF1C2AFA402eD8D009',
        entryPointVersion: '0.9',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x6839a4373751bb9d4b1acf2c77ff756067d5fa345b9943e8230fc60d0544f5d5"`,
    )
  })

  test('args: paymasterData', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x433709009B8330FDa32311DF1C2AFA402eD8D009',
        entryPointVersion: '0.9',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
          paymasterData: '0xdeadbeef',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xde381ae0368b77df677808c3a2da72abd68a07eab11ef31c35923f56a75bbe6d"`,
    )
  })

  test('args: paymasterSignature (0.9 feature)', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x433709009B8330FDa32311DF1C2AFA402eD8D009',
        entryPointVersion: '0.9',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
          paymasterData: '0xdeadbeef',
          paymasterSignature: '0xcafebabe',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x802c25af5d98cd349b2118227faa93172fb791c4130a482272095cec45c4fc6e"`,
    )
  })

  test('args: authorization', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x433709009B8330FDa32311DF1C2AFA402eD8D009',
        entryPointVersion: '0.9',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
          paymasterData: '0xdeadbeef',
          factory: '0x7702',
          factoryData: '0xdeadbeef',
          authorization: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 1,
            nonce: 0,
            yParity: 0,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x20993875bc385b402072201a31152ff8bfd6a53cf37607fbc68f1bdabff80a1f"`,
    )
  })
})

describe('entryPoint: 0.7', () => {
  test('default', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x1903d62bb5dc75af6fed866aa46d8e80063d9e288aa7f2caad0ff1fcae22e40d"`,
    )
  })

  test('args: factory + factoryData', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          factory: '0x1234567890123456789012345678901234567890',
          factoryData: '0xdeadbeef',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x46c1d51e831d50c1a93135f026a7d3f1921ed66e9c81da723dd3817a49f01bc1"`,
    )
  })

  test('args: paymaster', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x1f2cf8638ead0fc621c6fb1562b8222c06539efcec09be156191f72418ebb109"`,
    )
  })

  test('args: paymasterVerificationGasLimit', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x950763d3ef84eb05b6cd1d95f3b736bb02988d643c6e11a76bf8beddc611cc95"`,
    )
  })

  test('args: paymasterPostOpGasLimit', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xd6efc63c28df53b49dd6fa10cec0a92ac61f8c70e9a45265e39c955f9bf821ed"`,
    )
  })

  test('args: paymasterData', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
          paymasterData: '0xdeadbeef',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x265fc1350b3fc016d493f9533354cf1a758c0fb9ddbbfd8b19c987d4e8935eed"`,
    )
  })
})

describe('entryPoint: 0.6', () => {
  test('default', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.6',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xe331591ab320e956b5e93f04e1dcf706bc128bc7b510602d2e0553f8be25fcba"`,
    )
  })

  test('args: initCode', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.6',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          initCode: '0x1234567890123456789012345678901234567890deadbeef',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xaa4a4fa863b3018e0e23291ca82a8747d06c6a92548eb9198f54f4a63540d06e"`,
    )
  })

  test('args: paymasterAndData', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.6',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymasterAndData: '0x1234567890123456789012345678901234567890',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x72bb2d82af9e9da2079fab165bc219c967c6ca0a63dfa55f382c5914ba2f77c5"`,
    )
  })

  test('args: authorization', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.6',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          initCode: '0x7702',
          authorization: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 1,
            nonce: 0,
            yParity: 0,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xa9b77f87a292b7246c08f1846691b5d1c474e086f6d7daa0e47476fbaa516a22"`,
    )

    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.6',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          initCode: '0x7702000000000000000000000000000000000000deadbeef',
          authorization: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 1,
            nonce: 0,
            yParity: 0,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xaa4a4fa863b3018e0e23291ca82a8747d06c6a92548eb9198f54f4a63540d06e"`,
    )
  })
})
