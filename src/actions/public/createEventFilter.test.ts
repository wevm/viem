import { describe, expect, test } from 'vitest'

import { accounts, initialBlockNumber, publicClient } from '../../_test'

import { numberToHex, pad } from '../../utils'
import { buildFilterTopics, createEventFilter } from './createEventFilter'

describe('default', () => {
  test('no args', async () => {
    const filter = await createEventFilter(publicClient)
    expect(filter.id).toBeDefined()
    expect(filter.type).toBe('event')
  })

  test('args: address', async () => {
    await createEventFilter(publicClient, {
      address: accounts[0].address,
    })
  })

  test('args: event', async () => {
    await createEventFilter(publicClient, {
      event:
        'Transfer(address indexed from, address indexed to, uint256 value)',
    })
  })

  test('args: args (named)', async () => {
    await createEventFilter(publicClient, {
      event:
        'Transfer(address indexed from, address indexed to, uint256 value)',
      args: {
        from: accounts[0].address,
        to: accounts[0].address,
      },
    })
    await createEventFilter(publicClient, {
      event:
        'Transfer(address indexed from, address indexed to, uint256 value)',
      args: {
        from: accounts[0].address,
      },
    })
    await createEventFilter(publicClient, {
      event:
        'Transfer(address indexed from, address indexed to, uint256 value)',
      args: {
        to: [accounts[0].address, accounts[1].address],
      },
    })
  })

  test('args: args (unnamed)', async () => {
    await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      args: [accounts[0].address, accounts[1].address],
    })
    await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      args: [[accounts[0].address, accounts[1].address]],
    })
    await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      args: [null, accounts[0].address],
    })
    await createEventFilter(publicClient, {
      event: 'Transfer(address,address,uint256)',
      args: [],
    })
  })

  test('args: fromBlock', async () => {
    await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      fromBlock: initialBlockNumber,
    })
    await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      fromBlock: 'latest',
    })
  })

  test('args: toBlock', async () => {
    await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      toBlock: initialBlockNumber,
    })
    await createEventFilter(publicClient, {
      event: 'Transfer(address indexed, address indexed, uint256)',
      toBlock: 'latest',
    })
  })
})

describe('buildFilterTopics', () => {
  test('no args', () => {
    expect(
      buildFilterTopics({
        event: 'Transfer(address indexed from, address indexed to)',
      }),
    ).toEqual([
      '0x4853ae1b4d437c4255ac16cd3ceda3465975023f27cb141584cd9d44440fed82',
    ])

    expect(
      buildFilterTopics({
        event: 'NoArgs()',
      }),
    ).toEqual([
      '0xd144d9e3e4304378a275ce8c55f48e681b2038a3792520b00766e2cecef576f5',
    ])
  })

  test.skip('named args', () => {
    expect(
      buildFilterTopics({
        event: 'Transfer(address indexed from, address indexed to)',
        args: {
          from: accounts[0].address,
          to: accounts[1].address,
        },
      }),
    ).toEqual([
      '0x4853ae1b4d437c4255ac16cd3ceda3465975023f27cb141584cd9d44440fed82',
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      '0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8',
    ])

    expect(
      buildFilterTopics({
        event: 'Transfer(address indexed from, address indexed to)',
        args: {
          from: accounts[0].address,
        },
      }),
    ).toEqual([
      '0x4853ae1b4d437c4255ac16cd3ceda3465975023f27cb141584cd9d44440fed82',
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      null,
    ])

    expect(
      buildFilterTopics({
        event:
          'Transfer(address indexed from, uint indexed foo, bool indexed bar)',
        args: {
          from: accounts[0].address,
          foo: 12,
          bar: true,
        },
      }),
    ).toEqual([
      '0x053222ddc7d30875376c5627c53670e97f3b5741a004c9429ae150ba4def00da',
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      '0x000000000000000000000000000000000000000000000000000000000000000c',
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    ])
  })

  test.skip('unnamed args', () => {
    expect(
      buildFilterTopics({
        event: 'Transfer(address indexed, address indexed, uint indexed)',
        args: [accounts[0].address, accounts[1].address, 69420n],
      }),
    ).toEqual([
      '0x930a61a57a70a73c2a503615b87e2e54fe5b9cdeacda518270b852296ab1a377',
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      '0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8',
      pad(numberToHex(69420n)),
    ])

    expect(
      buildFilterTopics({
        event: 'Transfer(address indexed, address indexed)',
        args: [null, accounts[0].address],
      }),
    ).toEqual([
      '0x4853ae1b4d437c4255ac16cd3ceda3465975023f27cb141584cd9d44440fed82',
      null,
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    ])

    expect(
      buildFilterTopics({
        event: 'Transfer(address indexed, address indexed)',
        args: [null, [accounts[0].address, accounts[1].address]],
      }),
    ).toEqual([
      '0x4853ae1b4d437c4255ac16cd3ceda3465975023f27cb141584cd9d44440fed82',
      null,
      [
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        '0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8',
      ],
    ])

    expect(
      buildFilterTopics({
        event: 'Transfer(address indexed, address indexed)',
        args: [
          [accounts[2].address, accounts[3].address],
          [accounts[0].address, accounts[1].address],
        ],
      }),
    ).toEqual([
      '0x4853ae1b4d437c4255ac16cd3ceda3465975023f27cb141584cd9d44440fed82',
      [
        '0x0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc',
        '0x00000000000000000000000090f79bf6eb2c4f870365e785982e1f101e93b906',
      ],
      [
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        '0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8',
      ],
    ])

    expect(
      buildFilterTopics({
        event: 'Transfer(address indexed, uint indexed, bool indexed)',
        args: [
          [accounts[2].address, accounts[3].address],
          [23, 32],
          [true, false],
        ],
      }),
    ).toEqual([
      '0x053222ddc7d30875376c5627c53670e97f3b5741a004c9429ae150ba4def00da',
      [
        '0x0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc',
        '0x00000000000000000000000090f79bf6eb2c4f870365e785982e1f101e93b906',
      ],
      [
        '0x0000000000000000000000000000000000000000000000000000000000000017',
        '0x0000000000000000000000000000000000000000000000000000000000000020',
      ],
      [
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ],
    ])
  })

  // TODO: more arg types
})
