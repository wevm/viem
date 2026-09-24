import * as Abis from '../Abis.js'

export const fundingErrors = [
  ...Abis.accountKeychain,
  ...Abis.earnFundingSource,
  ...Abis.fundingPolicy,
  ...Abis.fundingSource,
  ...Abis.stablecoinDex,
  ...Abis.tip20Funder,
  ...Abis.tip403Registry,
].filter((item) => item.type === 'error')
