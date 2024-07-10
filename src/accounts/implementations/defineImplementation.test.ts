import { expect, test } from 'vitest'
import { defineImplementation } from './defineImplementation.js'

test('defineImplementation', () => {
  const implementation = defineImplementation(() => ({
    abi: [],
    entryPoint: {
      abi: [],
      address: '0x',
      version: '0.7',
    },
    factory: {
      abi: [],
      address: '0x',
    },
    async encodeCalls(_calls) {
      return '0x'
    },
    async getAddress() {
      return '0x'
    },
    async getFactoryArgs() {
      return {
        factory: '0x',
        factoryData: '0x',
      }
    },
    async getNonce() {
      return 1n
    },
    async getSignature(_packedUserOperation) {
      return '0x'
    },
    async signMessage(_message) {
      return '0x'
    },
    async signTypedData(_typedData) {
      return '0x'
    },
    async signUserOperation(_userOperation) {
      return '0x'
    },
  }))

  expect(implementation).toBeDefined()
})
