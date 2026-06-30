// Generated with `pnpm gen:token-lookup`. Do not modify manually.

export type TokenLookupChain = {
  readonly address: string
  readonly id: number
  readonly name: string
}

export type TokenLookupToken = {
  readonly chains: readonly TokenLookupChain[]
  readonly currency?: string | undefined
  readonly decimals: number
  readonly importName: string
  readonly name: string
  readonly popular?: boolean | undefined
  readonly symbol: string
}

export const tokenLookupData = [
  {
    chains: [
      {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        id: 1,
        name: 'Ethereum',
      },
      {
        address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        id: 10,
        name: 'OP Mainnet',
      },
      {
        address: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
        id: 130,
        name: 'Unichain',
      },
      {
        address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        id: 137,
        name: 'Polygon',
      },
      {
        address: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
        id: 146,
        name: 'Sonic',
      },
      {
        address: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1',
        id: 480,
        name: 'World Chain',
      },
      {
        address: '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392',
        id: 1329,
        name: 'Sei Network',
      },
      {
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        id: 8453,
        name: 'Base',
      },
      {
        address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        id: 42161,
        name: 'Arbitrum One',
      },
      {
        address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        id: 43114,
        name: 'Avalanche',
      },
      {
        address: '0x2D270e6886d130D724215A266106e6832161EAEd',
        id: 57073,
        name: 'Ink',
      },
      {
        address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
        id: 59144,
        name: 'Linea Mainnet',
      },
      {
        address: '0xd996633a415985DBd7D6D12f4A4343E31f5037cf',
        id: 81224,
        name: 'Codex',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'usdc',
    name: 'USD Coin',
    popular: true,
    symbol: 'USDC',
  },
  {
    chains: [
      {
        address: '0x20c000000000000000000000f047dd7018e50367',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'BRL',
    decimals: 6,
    importName: 'brla',
    name: 'BRLA Token',
    symbol: 'BRLA',
  },
  {
    chains: [
      {
        address: '0x20c000000000000000000000c412ec89d0c08be5',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'BTC',
    decimals: 6,
    importName: 'cbbtc',
    name: 'Coinbase Wrapped BTC',
    symbol: 'cbBTC',
  },
  {
    chains: [
      {
        address: '0x20c00000000000000000000042109aef2f8b28e1',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'CHF',
    decimals: 6,
    importName: 'chfau',
    name: 'AllUnity CHF',
    symbol: 'CHFAU',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000000520792dcccccccc',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'cusd',
    name: 'Cap USD',
    symbol: 'cUSD',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000006fd9a167923ba194',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'dlusd',
    name: 'Deel USD',
    symbol: 'DLUSD',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000009a4a4b17e0dc6651',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'EUR',
    decimals: 6,
    importName: 'eurau',
    name: 'AllUnity EUR',
    symbol: 'EURAU',
  },
  {
    chains: [
      {
        address: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
        id: 1,
        name: 'Ethereum',
      },
      {
        address: '0xA6dE01a2d62C6B5f3525d768f34d276652C554c8',
        id: 25,
        name: 'Cronos Mainnet',
      },
      {
        address: '0x1C60ba0A0eD1019e8Eb035E6daF4155A5cE2380B',
        id: 480,
        name: 'World Chain',
      },
      {
        address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
        id: 8453,
        name: 'Base',
      },
      {
        address: '0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD',
        id: 43114,
        name: 'Avalanche',
      },
    ],
    currency: 'EUR',
    decimals: 6,
    importName: 'eurc',
    name: 'EURC',
    symbol: 'EURC',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000001621e21f71cf12fb',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'EUR',
    decimals: 6,
    importName: 'eurce',
    name: 'Bridged EURC (Stargate)',
    symbol: 'EURC.e',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000003554d28269e0f3c2',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'frxusd',
    name: 'Frax USD',
    symbol: 'frxUSD',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000000a6da882d075a4c3',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'GBP',
    decimals: 6,
    importName: 'gbpa',
    name: 'Agant GBP',
    symbol: 'GBPA',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000005c0bac7cef389a11',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'gusd',
    name: 'Generic USD',
    symbol: 'GUSD',
  },
  {
    chains: [
      {
        address: '0x20c000000000000000000000ab02d39df30bd17e',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'iusd',
    name: 'InfiniFi USD',
    symbol: 'iUSD',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000000000000000000000',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'pathusd',
    name: 'PathUSD',
    symbol: 'pathUSD',
  },
  {
    chains: [
      {
        address: '0x20c000000000000000000000383a23bacb546ab9',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'reusd',
    name: 'Re Protocol reUSD',
    symbol: 'reUSD',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000007f7ba549dd0251b9',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'rusd',
    name: 'Reservoir Stablecoin',
    symbol: 'rUSD',
  },
  {
    chains: [
      {
        address: '0x20c000000000000000000000ae247a1130450f09',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'sbc',
    name: 'Stable Coin',
    symbol: 'SBC',
  },
  {
    chains: [
      {
        address: '0x20c000000000000000000000048c8f36df1c9a4a',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'siUSD',
    decimals: 6,
    importName: 'siusd',
    name: 'InfiniFi Staked USD',
    symbol: 'siUSD',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000008ee4fcff88888888',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'stcUSD',
    decimals: 6,
    importName: 'stcusd',
    name: 'Staked Cap USD',
    symbol: 'stcUSD',
  },
  {
    chains: [
      {
        address: '0x20c000000000000000000000bd95bfb69fbe6ce3',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'sUSDe',
    decimals: 6,
    importName: 'susde',
    name: 'Staked USDe',
    symbol: 'sUSDe',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000008191667423f70e67',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'syrupUSDC',
    decimals: 6,
    importName: 'syrupusdc',
    name: 'Syrup USDC',
    symbol: 'syrupUSDC',
  },
  {
    chains: [
      {
        address: '0x20c000000000000000000000111111111e910f0f',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'usd1',
    name: 'USD1',
    symbol: 'USD1',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000003158081efd85bfc2',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'usdb',
    name: 'USDBridge',
    symbol: 'USDB',
  },
  {
    chains: [
      {
        address: '0x20c000000000000000000000b9537d11c60e8b50',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'usdce',
    name: 'Bridged USDC (Stargate)',
    symbol: 'USDC.e',
  },
  {
    chains: [
      {
        address: '0x20c0000000000000000000002f52d5cc21a3207b',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'usde',
    name: 'USDe',
    symbol: 'USDe',
  },
  {
    chains: [
      {
        address: '0x20c00000000000000000000014f22ca97301eb73',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'usdt0',
    name: 'USDT0',
    symbol: 'USDT0',
  },
  {
    chains: [
      {
        address: '0x136471a34f6ef19fE571EFFC1CA711fdb8E49f2b',
        id: 1,
        name: 'Ethereum',
      },
      {
        address: '0x8D0fA28f221eB5735BC71d3a0Da67EE5bC821311',
        id: 56,
        name: 'BNB Smart Chain',
      },
    ],
    currency: 'USD',
    decimals: 6,
    importName: 'usyc',
    name: 'US Yield Coin',
    symbol: 'USYC',
  },
  {
    chains: [
      {
        address: '0x20c000000000000000000000aeed2ec36a54d0e5',
        id: 4217,
        name: 'Tempo Mainnet',
      },
    ],
    currency: 'wsrUSD',
    decimals: 6,
    importName: 'wsrusd',
    name: 'Wrapped Savings rUSD',
    symbol: 'wsrUSD',
  },
] as const satisfies readonly TokenLookupToken[]
