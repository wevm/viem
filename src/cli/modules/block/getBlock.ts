import { ChainArgvs, WriteOutputArgvs } from '../../argvs.js'
import type { Command } from '../../command.js'
import CliHelper from '../../command.js'

export default class GetBlock implements Command {
  public readonly name: string = 'getBlock'
  public readonly describe: string = 'Get block data by number or hash'

  public async execute(argv: any) {
    const client = CliHelper.getClient({
      chain: argv.chain.toLowerCase(),
      rpc: argv.rpc,
    })

    if (!client) {
      console.log(`Chain ${argv.chain} is not supported!`)
    } else {
      const block = await client.getBlock({
        includeTransactions: argv.full,
        blockNumber: argv.number ? argv.number : undefined,
        blockHash: argv.hash ? argv.hash : undefined,
      })

      CliHelper.writeOutput({
        format: argv.output,
        filePath: argv.file,
        data: block,
      })
    }
  }

  public setOptions(yargs: any) {
    return yargs.option({
      ...ChainArgvs,
      ...WriteOutputArgvs,

      number: {
        type: 'number',
        default: 0,
        describe: 'The block number being queried',
      },
      hash: {
        type: 'string',
        default: '',
        describe: 'The block hash being queried',
      },
      full: {
        type: 'boolean',
        default: false,
        describe: 'Get block transaction objects',
      },
    })
  }
}
