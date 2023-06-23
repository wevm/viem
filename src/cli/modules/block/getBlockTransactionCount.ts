import { ChainArgvs, WriteOutputArgvs } from '../../argvs.js'
import type { Command } from '../../command.js'
import CliHelper from '../../command.js'

export default class GetBlockTransactionCount implements Command {
  public readonly name: string = 'getBlockTransactionCount'
  public readonly describe: string = 'Get transaction count of a block'

  public async execute(argv: any) {
    const client = CliHelper.getClient({
      chain: argv.chain.toLowerCase(),
      rpc: argv.rpc,
    })

    if (!client) {
      console.log(`Chain ${argv.chain} is not supported!`)
    } else {
      const count = await client.getBlockTransactionCount()

      CliHelper.writeOutput({
        format: argv.output,
        filePath: argv.file,
        data: count.toString(),
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
    })
  }
}
