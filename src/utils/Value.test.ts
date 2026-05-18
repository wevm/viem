import { expect, test } from 'vitest'

import { formatEther } from '../../src-old/utils/unit/formatEther.js'
import { formatGwei } from '../../src-old/utils/unit/formatGwei.js'
import { formatUnits } from '../../src-old/utils/unit/formatUnits.js'
import { parseEther } from '../../src-old/utils/unit/parseEther.js'
import { parseGwei } from '../../src-old/utils/unit/parseGwei.js'
import { parseUnits } from '../../src-old/utils/unit/parseUnits.js'
import * as Value from './Value.js'

test('matches retained v2 value formatting behavior', () => {
  expect({
    ether: Value.formatEther(1234500000000000000n),
    etherFromGwei: Value.formatEther(1234500000n, 'gwei'),
    gwei: Value.formatGwei(1234500000n),
    units: Value.format(123450000000n, 9),
  }).toEqual({
    ether: formatEther(1234500000000000000n),
    etherFromGwei: formatEther(1234500000n, 'gwei'),
    gwei: formatGwei(1234500000n),
    units: formatUnits(123450000000n, 9),
  })
})

test('matches retained v2 value parsing behavior', () => {
  expect({
    ether: Value.fromEther('1.2345'),
    etherToGwei: Value.fromEther('1.2345', 'gwei'),
    gwei: Value.fromGwei('1.2345'),
    units: Value.from('123.45', 9),
  }).toEqual({
    ether: parseEther('1.2345'),
    etherToGwei: parseEther('1.2345', 'gwei'),
    gwei: parseGwei('1.2345'),
    units: parseUnits('123.45', 9),
  })
})
