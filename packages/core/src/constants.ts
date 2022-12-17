export const etherUnits = {
  gwei: 9,
  wei: 18,
}
export const gweiUnits = {
  ether: -9,
  wei: 9,
}
export const weiUnits = {
  ether: -18,
  gwei: -9,
}

export const transactionType = {
  '0x0': 'legacy',
  '0x1': 'eip2930',
  '0x2': 'eip1559',
} as const
