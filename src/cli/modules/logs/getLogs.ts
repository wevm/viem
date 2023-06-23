import { ChainArgvs, WriteOutputArgvs } from '../../argvs.js'
import type { Command } from '../../command.js'
import CliHelper from '../../command.js'

export default class GetLogs implements Command {
  public readonly name: string = 'getLogs'
  public readonly describe: string = 'Get block logs by given filters'

  public async execute(argv: any) {
    const client = CliHelper.getClient({
      chain: argv.chain.toLowerCase(),
      rpc: argv.rpc,
    })

    if (!client) {
      console.log(`Chain ${argv.chain} is not supported!`)
    } else {
      const logs = await client.getLogs({
        address: argv.address ? argv.address : undefined,
        event: argv.topic !== '' ? argv.topic : undefined,
        fromBlock: argv.fromBlock ? argv.fromBlock : undefined,
        toBlock: argv.toBlock ? argv.toBlock : undefined,
      })

      CliHelper.writeOutput({
        format: argv.output,
        filePath: argv.file,
        data: logs,
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
        describe: 'Get logs from given contract address',
      },
      topic: {
        type: 'string',
        default: '',
        describe: 'Get logs by given topic',
      },
      fromBlock: {
        type: 'number',
        default: 0,
        describe: 'Get logs data from given block number',
      },
      toBlock: {
        type: 'number',
        default: 0,
        describe: 'Get logs data to given block number',
      },
    })
  }
}
