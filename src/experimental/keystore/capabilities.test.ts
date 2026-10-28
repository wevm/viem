import { describe, expect, test } from 'vitest'
import {
  eip8130Capabilities,
  eip8130CapabilitiesByChain,
  supportedPermissionTypes,
  supportedPolicyTypes,
  supportedSubAccountKeyTypes,
} from './capabilities.js'

describe('eip8130Capabilities', () => {
  test('advertises exactly what the adapters support', () => {
    expect(eip8130Capabilities()).toEqual({
      atomic: { status: 'supported' },
      permissions: {
        supported: true,
        signerTypes: ['account', 'key'],
        permissionTypes: supportedPermissionTypes,
        policyTypes: supportedPolicyTypes,
      },
      unstable_addSubAccount: {
        supported: true,
        keyTypes: supportedSubAccountKeyTypes,
      },
    })
  })

  test('does not advertise custom / gas-limit (not safely lowerable)', () => {
    const { permissions } = eip8130Capabilities()
    expect(permissions.permissionTypes).not.toContain('custom')
    expect(permissions.policyTypes).not.toContain('custom')
    expect(permissions.policyTypes).not.toContain('gas-limit')
  })

  test('paymasterService advertised only when set', () => {
    expect(eip8130Capabilities().paymasterService).toBeUndefined()
    expect(eip8130Capabilities({ paymasterService: true })).toMatchObject({
      paymasterService: { supported: true },
    })
    expect(
      eip8130Capabilities({ paymasterService: false }).paymasterService,
    ).toEqual({ supported: false })
  })

  test('overrides are respected', () => {
    const caps = eip8130Capabilities({
      permissionTypes: ['erc20-token-transfer'],
      subAccountKeyTypes: ['address'],
    })
    expect(caps.permissions.permissionTypes).toEqual(['erc20-token-transfer'])
    expect(caps.unstable_addSubAccount.keyTypes).toEqual(['address'])
  })
})

describe('eip8130CapabilitiesByChain', () => {
  test('keys the descriptor by hex chain id', () => {
    const record = eip8130CapabilitiesByChain([8453, '0x14a34'])
    expect(Object.keys(record)).toEqual(['0x2105', '0x14a34'])
    expect(record['0x2105']).toEqual(eip8130Capabilities())
    expect(record['0x14a34']).toEqual(record['0x2105'])
  })
})
