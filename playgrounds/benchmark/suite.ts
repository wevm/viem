import { ethers } from 'ethers'
import {
  fetchBalance,
  fetchBlock,
  fetchBlockNumber,
  fetchTransaction,
  sendTransaction,
} from 'viem/actions'
import { createClient, http } from 'viem/clients'
import { mainnet } from 'viem/chains'
import { etherToValue } from 'viem/utils'

export type SuiteItem = {
  title: string
  key: string
  fns: {
    viem: () => Promise<void>
    ethers: () => Promise<void>
  }
}
export type Suite = SuiteItem[]

export const getSuite = ({ url }: { url: string }): Suite => {
  const viemClient = createClient(http({ chain: mainnet, url }))
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
          await fetchBlock(viemClient, { blockNumber: 69420 })
        },
        ethers: async () => {
          await ethersProvider.getBlock(69420)
        },
      },
    },
    {
      title: 'block by number w/ txns',
      key: 'blockByNumberWithTxns',
      fns: {
        viem: async () => {
          await fetchBlock(viemClient, {
            blockNumber: 69420,
            includeTransactions: true,
          })
        },
        ethers: async () => {
          await ethersProvider.getBlockWithTransactions(69420)
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
      title: 'block by hash w/ txns',
      key: 'blockByHashWithTxns',
      fns: {
        viem: async () => {
          await fetchBlock(viemClient, {
            blockHash:
              '0x70d7e49dfc4dcc8c5f18b3c66744f625acd0886da57b1bfd46503809aa1b6250',
            includeTransactions: true,
          })
        },
        ethers: async () => {
          await ethersProvider.getBlockWithTransactions(
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
  ]
}
