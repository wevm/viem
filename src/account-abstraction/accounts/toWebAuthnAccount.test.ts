import { expect, test } from 'vitest'

import { verify } from 'webauthn-p256'
import { typedData } from '../../../test/src/constants.js'
import { hashMessage, hashTypedData, keccak256 } from '../../utils/index.js'
import { toWebAuthnAccount } from './toWebAuthnAccount.js'

const credential = {
  id: 'm1-bMPuAqpWhCxHZQZTT6e-lSPntQbh3opIoGe7g4Qs',
  publicKey:
    '0x7da44d4bc972affd138c619a211ef0afe0926b813fec67d15587cf8625b2bf185f5044ae96640a63b32aa1eb6f8f993006bbd26292b81cb07a0672302c69a866',
} as const

test('default', () => {
  const account = toWebAuthnAccount({
    credential,
    getFn() {
      return Promise.resolve({
        response: {
          authenticatorData: [
            73, 150, 13, 229, 136, 14, 140, 104, 116, 52, 23, 15, 100, 118, 96,
            91, 143, 228, 174, 185, 162, 134, 50, 199, 153, 92, 243, 186, 131,
            29, 151, 99, 5, 0, 0, 0, 0,
          ],
          clientDataJSON: [
            123, 34, 116, 121, 112, 101, 34, 58, 34, 119, 101, 98, 97, 117, 116,
            104, 110, 46, 103, 101, 116, 34, 44, 34, 99, 104, 97, 108, 108, 101,
            110, 103, 101, 34, 58, 34, 49, 80, 49, 79, 71, 74, 69, 121, 74, 122,
            65, 50, 82, 74, 95, 74, 52, 82, 71, 89, 120, 122, 107, 87, 71, 48,
            119, 66, 70, 113, 109, 105, 51, 77, 51, 54, 72, 69, 107, 103, 66,
            118, 69, 34, 44, 34, 111, 114, 105, 103, 105, 110, 34, 58, 34, 104,
            116, 116, 112, 58, 47, 47, 108, 111, 99, 97, 108, 104, 111, 115,
            116, 58, 53, 49, 55, 51, 34, 44, 34, 99, 114, 111, 115, 115, 79,
            114, 105, 103, 105, 110, 34, 58, 102, 97, 108, 115, 101, 125,
          ],
          signature: [
            48, 69, 2, 33, 0, 198, 106, 113, 129, 35, 170, 51, 12, 13, 0, 67,
            158, 211, 55, 188, 103, 33, 194, 2, 152, 190, 159, 181, 11, 176,
            232, 114, 59, 99, 64, 167, 220, 2, 32, 101, 188, 55, 216, 145, 203,
            39, 137, 83, 114, 45, 10, 147, 246, 218, 247, 132, 221, 228, 225,
            57, 110, 143, 87, 172, 198, 76, 141, 30, 169, 166, 2,
          ],
        },
      } as any)
    },
    rpId: '',
  })

  expect(account).toMatchInlineSnapshot(`
    {
      "publicKey": "0x7da44d4bc972affd138c619a211ef0afe0926b813fec67d15587cf8625b2bf185f5044ae96640a63b32aa1eb6f8f993006bbd26292b81cb07a0672302c69a866",
      "sign": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "type": "webAuthn",
    }
  `)
})

test('sign', async () => {
  const account = toWebAuthnAccount({
    credential,
    getFn() {
      return Promise.resolve({
        response: {
          authenticatorData: [
            73, 150, 13, 229, 136, 14, 140, 104, 116, 52, 23, 15, 100, 118, 96,
            91, 143, 228, 174, 185, 162, 134, 50, 199, 153, 92, 243, 186, 131,
            29, 151, 99, 5, 0, 0, 0, 0,
          ],
          clientDataJSON: [
            123, 34, 116, 121, 112, 101, 34, 58, 34, 119, 101, 98, 97, 117, 116,
            104, 110, 46, 103, 101, 116, 34, 44, 34, 99, 104, 97, 108, 108, 101,
            110, 103, 101, 34, 58, 34, 49, 80, 49, 79, 71, 74, 69, 121, 74, 122,
            65, 50, 82, 74, 95, 74, 52, 82, 71, 89, 120, 122, 107, 87, 71, 48,
            119, 66, 70, 113, 109, 105, 51, 77, 51, 54, 72, 69, 107, 103, 66,
            118, 69, 34, 44, 34, 111, 114, 105, 103, 105, 110, 34, 58, 34, 104,
            116, 116, 112, 58, 47, 47, 108, 111, 99, 97, 108, 104, 111, 115,
            116, 58, 53, 49, 55, 51, 34, 44, 34, 99, 114, 111, 115, 115, 79,
            114, 105, 103, 105, 110, 34, 58, 102, 97, 108, 115, 101, 125,
          ],
          signature: [
            48, 69, 2, 33, 0, 198, 106, 113, 129, 35, 170, 51, 12, 13, 0, 67,
            158, 211, 55, 188, 103, 33, 194, 2, 152, 190, 159, 181, 11, 176,
            232, 114, 59, 99, 64, 167, 220, 2, 32, 101, 188, 55, 216, 145, 203,
            39, 137, 83, 114, 45, 10, 147, 246, 218, 247, 132, 221, 228, 225,
            57, 110, 143, 87, 172, 198, 76, 141, 30, 169, 166, 2,
          ],
        },
      } as any)
    },
    rpId: '',
  })

  const { signature, webauthn } = await account.sign({
    hash: keccak256('0xdeadbeef'),
  })
  expect(signature).toMatchInlineSnapshot(
    `"0xc66a718123aa330c0d00439ed337bc6721c20298be9fb50bb0e8723b6340a7dc65bc37d891cb278953722d0a93f6daf784dde4e1396e8f57acc64c8d1ea9a602"`,
  )
  expect(webauthn).toMatchInlineSnapshot(`
    {
      "authenticatorData": "0x49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000",
      "challengeIndex": 23,
      "clientDataJSON": "{"type":"webauthn.get","challenge":"1P1OGJEyJzA2RJ_J4RGYxzkWG0wBFqmi3M36HEkgBvE","origin":"http://localhost:5173","crossOrigin":false}",
      "typeIndex": 1,
      "userVerificationRequired": true,
    }
  `)

  const valid = await verify({
    publicKey: account.publicKey,
    signature,
    webauthn,
    hash: keccak256('0xdeadbeef'),
  })
  expect(valid).toBeTruthy()
})

test('signMessage', async () => {
  const account = toWebAuthnAccount({
    credential,
    getFn() {
      return Promise.resolve({
        response: {
          authenticatorData: [
            73, 150, 13, 229, 136, 14, 140, 104, 116, 52, 23, 15, 100, 118, 96,
            91, 143, 228, 174, 185, 162, 134, 50, 199, 153, 92, 243, 186, 131,
            29, 151, 99, 5, 0, 0, 0, 0,
          ],
          clientDataJSON: [
            123, 34, 116, 121, 112, 101, 34, 58, 34, 119, 101, 98, 97, 117, 116,
            104, 110, 46, 103, 101, 116, 34, 44, 34, 99, 104, 97, 108, 108, 101,
            110, 103, 101, 34, 58, 34, 50, 101, 117, 104, 98, 116, 68, 115, 114,
            107, 77, 114, 99, 102, 52, 65, 106, 74, 106, 77, 104, 121, 117, 48,
            122, 67, 70, 78, 77, 105, 67, 106, 98, 122, 90, 84, 74, 115, 45, 65,
            102, 87, 103, 34, 44, 34, 111, 114, 105, 103, 105, 110, 34, 58, 34,
            104, 116, 116, 112, 58, 47, 47, 108, 111, 99, 97, 108, 104, 111,
            115, 116, 58, 53, 49, 55, 51, 34, 44, 34, 99, 114, 111, 115, 115,
            79, 114, 105, 103, 105, 110, 34, 58, 102, 97, 108, 115, 101, 125,
          ],
          signature: [
            48, 70, 2, 33, 0, 215, 17, 41, 164, 245, 200, 169, 221, 111, 79,
            113, 113, 22, 192, 18, 104, 199, 84, 214, 93, 161, 123, 165, 218,
            235, 205, 234, 229, 227, 137, 140, 214, 2, 33, 0, 251, 52, 21, 124,
            207, 143, 197, 95, 74, 186, 108, 41, 29, 50, 148, 240, 50, 88, 75,
            199, 167, 150, 30, 242, 151, 157, 172, 209, 243, 251, 150, 0,
          ],
        },
      } as any)
    },
    rpId: '',
  })

  const { signature, webauthn } = await account.signMessage({
    message: 'hello world',
  })
  expect(signature).toMatchInlineSnapshot(
    `"0xd71129a4f5c8a9dd6f4f717116c01268c754d65da17ba5daebcdeae5e3898cd604cbea8230703aa1b54593d6e2cd6b0f8a8eaee5ff817f925c1c1df108678f51"`,
  )
  expect(webauthn).toMatchInlineSnapshot(`
    {
      "authenticatorData": "0x49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000",
      "challengeIndex": 23,
      "clientDataJSON": "{"type":"webauthn.get","challenge":"2euhbtDsrkMrcf4AjJjMhyu0zCFNMiCjbzZTJs-AfWg","origin":"http://localhost:5173","crossOrigin":false}",
      "typeIndex": 1,
      "userVerificationRequired": true,
    }
  `)

  const valid = await verify({
    publicKey: account.publicKey,
    signature,
    webauthn,
    hash: hashMessage('hello world'),
  })
  expect(valid).toBeTruthy()
})

test('signTypedData', async () => {
  const account = toWebAuthnAccount({
    credential,
    getFn() {
      return Promise.resolve({
        response: {
          authenticatorData: [
            73, 150, 13, 229, 136, 14, 140, 104, 116, 52, 23, 15, 100, 118, 96,
            91, 143, 228, 174, 185, 162, 134, 50, 199, 153, 92, 243, 186, 131,
            29, 151, 99, 5, 0, 0, 0, 0,
          ],
          clientDataJSON: [
            123, 34, 116, 121, 112, 101, 34, 58, 34, 119, 101, 98, 97, 117, 116,
            104, 110, 46, 103, 101, 116, 34, 44, 34, 99, 104, 97, 108, 108, 101,
            110, 103, 101, 34, 58, 34, 82, 73, 57, 85, 100, 105, 55, 52, 55, 77,
            122, 99, 84, 82, 109, 55, 102, 85, 90, 120, 89, 84, 103, 56, 49, 76,
            74, 120, 89, 88, 113, 77, 55, 103, 88, 72, 107, 79, 116, 48, 88, 88,
            81, 34, 44, 34, 111, 114, 105, 103, 105, 110, 34, 58, 34, 104, 116,
            116, 112, 58, 47, 47, 108, 111, 99, 97, 108, 104, 111, 115, 116, 58,
            53, 49, 55, 51, 34, 44, 34, 99, 114, 111, 115, 115, 79, 114, 105,
            103, 105, 110, 34, 58, 102, 97, 108, 115, 101, 125,
          ],
          signature: [
            48, 70, 2, 33, 0, 219, 56, 226, 2, 191, 251, 36, 243, 70, 88, 37,
            225, 236, 241, 104, 187, 47, 81, 87, 7, 16, 211, 181, 159, 49, 169,
            108, 82, 230, 211, 252, 240, 2, 33, 0, 199, 209, 17, 44, 62, 29, 54,
            131, 8, 7, 251, 37, 243, 68, 151, 59, 117, 1, 204, 115, 28, 167,
            248, 47, 147, 16, 221, 102, 225, 110, 128, 103,
          ],
        },
      } as any)
    },
    rpId: '',
  })

  const { signature, webauthn } = await account.signTypedData({
    ...typedData.basic,
    primaryType: 'Mail',
  })
  expect(signature).toMatchInlineSnapshot(
    `"0xdb38e202bffb24f3465825e1ecf168bb2f51570710d3b59f31a96c52e6d3fcf0382eeed2c1e2c97df7f804da0cbb68c447e52e3a8a6fa65560a8ed5c1af4a4ea"`,
  )
  expect(webauthn).toMatchInlineSnapshot(`
    {
      "authenticatorData": "0x49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000",
      "challengeIndex": 23,
      "clientDataJSON": "{"type":"webauthn.get","challenge":"RI9Udi747MzcTRm7fUZxYTg81LJxYXqM7gXHkOt0XXQ","origin":"http://localhost:5173","crossOrigin":false}",
      "typeIndex": 1,
      "userVerificationRequired": true,
    }
  `)

  const valid = await verify({
    publicKey: account.publicKey,
    signature,
    webauthn,
    hash: hashTypedData({
      ...typedData.basic,
      primaryType: 'Mail',
    }),
  })
  expect(valid).toBeTruthy()
})
