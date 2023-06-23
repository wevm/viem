import { ChainArgvs, WriteOutputArgvs } from '../../argvs.js'
import type { Command } from '../../command.js'
import CliHelper from '../../command.js'

export default class GetTransactionCount implements Command {
  public readonly name: string = 'getTransactionCount'
  public readonly describe: string = 'Get address transaction count'

  public async execute(argv: any) {
    const client = CliHelper.getClient({
      chain: argv.chain.toLowerCase(),
      rpc: argv.rpc,
    })

    if (!client) {
      console.log(`Chain ${argv.chain} is not supported!`)
    } else {
      const count = await client.getTransactionCount({
        address: argv.address,
      })

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

      address: {
        type: 'string',
        default: '',
        describe: 'The block number being queried',
      },
    })
  }
}
