export type Sponsors = {
  tier?: string
  size?: 'medium' | 'big'
  items: Sponsor[]
}[]

export type Sponsor = {
  name: string
  img: string
  url: string
}

export const sponsors = [
  {
    size: 'big',
    tier: 'Collaborators',
    items: [
      {
        name: 'Paradigm',
        url: 'https://paradigm.xyz',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/paradigm-light.svg',
      },
    ],
  },
  {
    size: 'medium',
    tier: 'Large Enterprises',
    items: [
      {
        name: 'LooksRare',
        url: 'https://looksrare.org',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/looksrare-light.svg',
      },
      {
        name: 'WalletConnect',
        url: 'https://walletconnect.com',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/walletconnect-light.svg',
      },
      {
        name: 'Stripe',
        url: 'https://www.stripe.com',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/stripe-light.svg',
      },
    ],
  },
  {
    size: 'medium',
    tier: 'Small Enterprises',
    items: [
      {
        name: 'Family',
        url: 'https://twitter.com/family',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/family-light.svg',
      },
      {
        name: 'Context',
        url: 'https://twitter.com/context',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/context-light.svg',
      },
      {
        name: 'PartyDAO',
        url: 'https://twitter.com/prtyDAO',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/partydao-light.svg',
      },
    ],
  },
  {
    size: 'medium',
    items: [
      {
        name: 'SushiSwap',
        url: 'https://www.sushi.com',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/sushi-light.svg',
      },
      {
        name: 'Dynamic',
        url: 'https://www.dynamic.xyz',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/dynamic-light.svg',
      },
      {
        name: 'BitKeep',
        url: 'https://bitkeep.com',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/bitkeep-light.svg',
      },
    ],
  },
  {
    size: 'medium',
    items: [
      {
        name: 'Privy',
        url: 'https://privy.io',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/privy-light.svg',
      },
      {
        name: 'Spruce',
        url: 'https://spruceid.com',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/spruce-light.svg',
      },
      {
        name: 'rollup.id',
        url: 'https://rollup.id',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/rollup.id-light.svg',
      },
    ],
  },
  {
    size: 'medium',
    items: [
      {
        name: 'PancakeSwap',
        url: 'https://pancakeswap.finance',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/pancake-light.svg',
      },
      {
        name: 'Celo',
        url: 'https://celo.org',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/celo-light.svg',
      },
      {
        name: 'Rainbow',
        url: 'https://rainbow.me',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/rainbow-light.svg',
      },
    ],
  },
  {
    size: 'medium',
    items: [
      {
        name: 'Pimlico',
        url: 'https://pimlico.io',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/pimlico-light.svg',
      },
      {
        name: 'Zora',
        url: 'https://zora.co',
        img: 'https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/zora-light.svg',
      },
    ],
  },
] satisfies Sponsors
