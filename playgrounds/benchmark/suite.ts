import { ethers, providers } from 'ethers'
import {
  fetchBalance,
  fetchBlock,
  fetchBlockNumber,
  fetchTransaction,
  sendTransaction,
} from 'viem/actions'
import { createClient, http } from 'viem/clients'
import { mainnet } from 'viem/chains'
import { etherToValue, formatBlock } from 'viem/utils'
import type { RpcBlock } from 'viem'

export type SuiteItem = {
  title: string
  key: string
  fns: {
    viem: () => void | Promise<void>
    ethers: () => void | Promise<void>
  }
}
export type Suite = SuiteItem[]

const block: RpcBlock = {
  baseFeePerGas: '0x1',
  difficulty: '0x2d3a678cddba9b',
  extraData: '0x',
  gasLimit: '0x1c9c347',
  gasUsed: '0x0',
  hash: '0xebc3644804e4040c0a74c5a5bbbc6b46a71a5d4010fe0c92ebb2fdf4a43ea5dd',
  logsBloom:
    '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  miner: '0x0000000000000000000000000000000000000000',
  mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  nonce: '0x0000000000000000',
  number: '0xec6fc6',
  parentHash:
    '0xe55516ad8029e53cd32087f14653d851401b05245abb1b2d6ed4ddcc597ac5a6',
  receiptsRoot:
    '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
  sealFields: [
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    '0x0000000000000000',
  ],
  sha3Uncles:
    '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
  size: '0x208',
  stateRoot:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  timestamp: '0x63198f6f',
  totalDifficulty: '0x1',
  transactions: [],
  transactionsRoot:
    '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
  uncles: [],
}

const formatter = new providers.Formatter()

export const getSuite = ({ url }: { url: string }): Suite => {
  const viemClient = createClient({ chain: mainnet, transport: http({ url }) })
  const ethersProvider = new ethers.providers.JsonRpcProvider(url)
  return [
    {
      title: 'current block number',
      key: 'blockNumber',
      fns: {
        viem: async () => {
          await fetchBlockNumber(viemClient)
        },
        ethers: async () => {
          await ethersProvider.getBlockNumber()
        },
      },
    },
    {
      title: 'block by number',
      key: 'blockByNumber',
      fns: {
        viem: async () => {
          await fetchBlock(viemClient, { blockNumber: 69420n })
        },
        ethers: async () => {
          await ethersProvider.getBlock(69420)
        },
      },
    },
    {
      title: 'block by hash',
      key: 'blockByHash',
      fns: {
        viem: async () => {
          await fetchBlock(viemClient, {
            blockHash:
              '0x70d7e49dfc4dcc8c5f18b3c66744f625acd0886da57b1bfd46503809aa1b6250',
          })
        },
        ethers: async () => {
          await ethersProvider.getBlock(
            '0x70d7e49dfc4dcc8c5f18b3c66744f625acd0886da57b1bfd46503809aa1b6250',
          )
        },
      },
    },
    {
      title: 'balance',
      key: 'balance',
      fns: {
        viem: async () => {
          await fetchBalance(viemClient, {
            address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          })
        },
        ethers: async () => {
          await ethersProvider.getBalance(
            '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          )
        },
      },
    },
    {
      title: 'get txn',
      key: 'getTransaction',
      fns: {
        viem: async () => {
          await fetchTransaction(viemClient, {
            hash: '0x493b3ce4b88a2b432c85f75ab18b1d54ac37d59659c2c4a41514c4c6f4d6a87f',
          })
        },
        ethers: async () => {
          await ethersProvider.getTransaction(
            '0x493b3ce4b88a2b432c85f75ab18b1d54ac37d59659c2c4a41514c4c6f4d6a87f',
          )
        },
      },
    },
    {
      title: 'send txn',
      key: 'sendTransaction',
      fns: {
        viem: async () => {
          await sendTransaction(viemClient, {
            request: {
              from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
              to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
              value: etherToValue('0.001'),
            },
          })
        },
        ethers: async () => {
          await ethersProvider
            .getSigner('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
            .sendTransaction({
              to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
              value: ethers.utils.parseEther('0.001'),
            })
        },
      },
    },
    {
      title: 'format block',
      key: 'formatBlock',
      fns: {
        viem: () => {
          formatBlock(block)
        },
        ethers: () => {
          formatter.block(block)
        },
      },
    },
  ]
}
