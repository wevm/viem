import yargs from 'yargs'

import GetChainId from './modules/chain/getChainId.js'

import GetGasPrice from './modules/fee/getGasPrice.js'

import GetBalance from './modules/address/getBalance.js'
import GetTransactionCount from './modules/address/getTransactionCount.js'

import GetBlock from './modules/block/getBlock.js'
import GetBlockNumber from './modules/block/getBlockNumber.js'
import GetBlockTransactionCount from './modules/block/getBlockTransactionCount.js'

import GetTransaction from './modules/transaction/getTransaction.js'
import GetTransactionReceipt from './modules/transaction/getTransactionReceipt.js'

import GetLogs from './modules/logs/getLogs.js'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}
;(async function () {
  // Chain
  const getChainId = new GetChainId()

  // Fee
  const getGasPrice = new GetGasPrice()

  // Address
  const getBalance = new GetBalance()
  const getTransactionCount = new GetTransactionCount()

  // Block
  const getBlockCommand = new GetBlock()
  const getBlockNumberCommand = new GetBlockNumber()
  const getBlockTransactionCount = new GetBlockTransactionCount()

  // Transaction
  const getTransaction = new GetTransaction()
  const getTransactionReceipt = new GetTransactionReceipt()

  // Logs
  const getLogs = new GetLogs()

  yargs(process.argv.slice(2))
    .scriptName('viem-cli')
    .command(
      getChainId.name,
      getChainId.describe,
      getChainId.setOptions,
      getChainId.execute,
    )
    .command(
      getGasPrice.name,
      getGasPrice.describe,
      getGasPrice.setOptions,
      getGasPrice.execute,
    )
    .command(
      getBalance.name,
      getBalance.describe,
      getBalance.setOptions,
      getBalance.execute,
    )
    .command(
      getTransactionCount.name,
      getTransactionCount.describe,
      getTransactionCount.setOptions,
      getTransactionCount.execute,
    )
    .command(
      getBlockCommand.name,
      getBlockCommand.describe,
      getBlockCommand.setOptions,
      getBlockCommand.execute,
    )
    .command(
      getBlockNumberCommand.name,
      getBlockNumberCommand.describe,
      getBlockNumberCommand.setOptions,
      getBlockNumberCommand.execute,
    )
    .command(
      getBlockTransactionCount.name,
      getBlockTransactionCount.describe,
      getBlockTransactionCount.setOptions,
      getBlockTransactionCount.execute,
    )
    .command(
      getTransaction.name,
      getTransaction.describe,
      getTransaction.setOptions,
      getTransaction.execute,
    )
    .command(
      getTransactionReceipt.name,
      getTransactionReceipt.describe,
      getTransactionReceipt.setOptions,
      getTransactionReceipt.execute,
    )
    .command(
      getLogs.name,
      getLogs.describe,
      getLogs.setOptions,
      getLogs.execute,
    )
    .help().argv
})()
