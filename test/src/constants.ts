import { Pool } from 'prool/vitest'

/** Per-worker pool id, appended to the local anvil proxy URL. */
export const poolId =
  process.env.VITEST_POOL_ID === undefined ? 1 : Pool.poolId()

export const accounts = [
  {
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    balance: 10000000000000000000000n,
    privateKey:
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    balance: 10000000000000000000000n,
    privateKey:
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  {
    address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    balance: 10000000000000000000000n,
    privateKey:
      '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  },
  {
    address: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
    balance: 10000000000000000000000n,
    privateKey:
      '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  },
  {
    address: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
    balance: 10000000000000000000000n,
    privateKey:
      '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  },
  {
    address: '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc',
    balance: 10000000000000000000000n,
    privateKey:
      '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  },
  {
    address: '0x976ea74026e726554db657fa54763abd0c3a0aa9',
    balance: 10000000000000000000000n,
    privateKey:
      '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
  },
  {
    address: '0x14dc79964da2c08b23698b3d3cc7ca32193d9955',
    balance: 10000000000000000000000n,
    privateKey:
      '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
  },
  {
    address: '0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f',
    balance: 10000000000000000000000n,
    privateKey:
      '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
  },
  {
    address: '0xa0ee7a142d267c1f36714e4a8f75612f20a79720',
    balance: 10000000000000000000000n,
    privateKey:
      '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
  },
  {
    address: '0x0eb552e73e6f8e0922749e0fb08af2a71ecb2b7f',
    balance: 10000000000000000000000n,
    privateKey:
      '0x39d9bd7d79d48fc17782a15c97a14e3c0c8c73d12012540a6423f435a7d4eac2',
  },
  {
    address: '0x302b6115587a87816dc1539c1ab3a02a4afc3278',
    balance: 10000000000000000000000n,
    privateKey:
      '0x10b238c30b6233d253261cb15bddf5478098560d18be43e4de4c68ee52c90347',
  },
  {
    address: '0xb59bfd2cb139c503c4172e26a6ddfdd1ce6f3795',
    balance: 10000000000000000000000n,
    privateKey:
      '0x3a90dda05433e82b27a6e3aa4de09edc3f2411a2f66329351dc29a6784db39d6',
  },
  {
    address: '0xda80546764d9d2177df07c20be896220d5f98c5a',
    balance: 10000000000000000000000n,
    privateKey:
      '0xb0ff59586bd60570965517ff07ee237193e5a1125e7fe8dbcc9f697108f0ab96',
  },
  {
    address: '0x59fc84c01c2317ccdda6be40ce1cff233215c84e',
    balance: 10000000000000000000000n,
    privateKey:
      '0x2d924e1fe6567627edb5b56c6a6f5724f96f9158a194f0f01f26b39661d413d6',
  },
  {
    address: '0x8e4d1a7b8c4f7f4204eb0643c85aa7656880e18b',
    balance: 10000000000000000000000n,
    privateKey:
      '0x92e512700e1018eceb72e1fcb357b30f698cd5b9773a284363bd9fa49a8f22cb',
  },
  {
    address: '0x52fecff3490ad3dae2f9b2c0a600f53e7bcb86de',
    balance: 10000000000000000000000n,
    privateKey:
      '0x03366b6e68bd067814509f67cceb657c91ff60ea994a438772f396912300d111',
  },
  {
    address: '0x2d6776fd5ea3c530b990268078ac39ac2ae1e6a8',
    balance: 10000000000000000000000n,
    privateKey:
      '0x88cb87b240b2805ef17369e7e340c35863c50470963f9196cd1fa0cf9b106d47',
  },
  {
    address: '0x1e2a9422ebcf2bb0f435d624910ee5086e523248',
    balance: 10000000000000000000000n,
    privateKey:
      '0xa54acf29653ca67e43aeb46cbd3a75e06afbcb1972e4ede779395ca014c64ed9',
  },
  {
    address: '0x8d610d35f9c616b6accba492eae3e83724b300a4',
    balance: 10000000000000000000000n,
    privateKey:
      '0x6eda73dd4c95b6fb5f6f69e6b0211841689aa3d13f5b34de53e5744ce85744de',
  },
  {
    address: '0x0f9e2db5d73bf2698b3cc235a719200d209cd77c',
    balance: 10000000000000000000000n,
    privateKey:
      '0x6415d927fc98a3582e5ab63738228ce26a58e32aad470673693c84a2e66425c2',
  },
] as const

export const typedData = {
  basic: {
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    },
    types: {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  },
  complex: {
    domain: {
      name: 'Ether Mail 🥵',
      version: '1.1.1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    },
    types: {
      Name: [
        { name: 'first', type: 'string' },
        { name: 'last', type: 'string' },
      ],
      Person: [
        { name: 'name', type: 'Name' },
        { name: 'wallet', type: 'address' },
        { name: 'favoriteColors', type: 'string[3]' },
        { name: 'foo', type: 'uint256' },
        { name: 'age', type: 'uint8' },
        { name: 'isCool', type: 'bool' },
      ],
      Mail: [
        { name: 'timestamp', type: 'uint256' },
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
        { name: 'hash', type: 'bytes' },
      ],
    },
    message: {
      timestamp: 1234567890n,
      contents: 'Hello, Bob! 🖤',
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      from: {
        name: {
          first: 'Cow',
          last: 'Burns',
        },
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        age: 69,
        foo: 123123123123123123n,
        favoriteColors: ['red', 'green', 'blue'],
        isCool: false,
      },
      to: {
        name: { first: 'Bob', last: 'Builder' },
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        age: 70,
        foo: 123123123123123123n,
        favoriteColors: ['orange', 'yellow', 'green'],
        isCool: true,
      },
    },
  },
} as const
