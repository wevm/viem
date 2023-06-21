import yargs from 'yargs'
import GetBlock from './modules/blocks/getBlock.js'
import GetBlockNumber from './modules/blocks/getBlockNumber.js'
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}
;(async function () {
  const getBlockCommand = new GetBlock()
  const getBlockNumberCommand = new GetBlockNumber()

  yargs(process.argv.slice(2))
    .scriptName('viem-cli')
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
    .help().argv
})()
