import { ChainArgvs, WriteOutputArgvs } from '../../argvs.js'
import type { Command } from '../../command.js'
import CliHelper from '../../command.js'

export default class GetBlockNumber implements Command {
  public readonly name: string = 'getBlockNumber'
  public readonly describe: string = 'Get latest block number'

  public async execute(argv: any) {
    const client = CliHelper.getClient({
      chain: argv.chain.toLowerCase(),
      rpc: argv.rpc,
    })

    if (!client) {
      console.log(`Chain ${argv.chain} is not supported!`)
    } else {
      const blockNumber = await client.getBlockNumber()

      CliHelper.writeOutput({
        format: argv.output,
        filePath: argv.file,
        data: blockNumber.toString(),
      })
    }
  }

  public setOptions(yargs: any) {
    return yargs.option({
      ...ChainArgvs,
      ...WriteOutputArgvs,
    })
  }
}
