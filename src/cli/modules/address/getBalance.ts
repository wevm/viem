import { ChainArgvs, WriteOutputArgvs } from '../../argvs.js'
import type { Command } from '../../command.js'
import CliHelper from '../../command.js'
import { BigNumber } from 'bignumber.js'

export default class GetBalance implements Command {
  public readonly name: string = 'getBalance'
  public readonly describe: string = 'Get address balance'

  public async execute(argv: any) {
    const client = CliHelper.getClient({
      chain: argv.chain.toLowerCase(),
      rpc: argv.rpc,
    })

    if (!client) {
      console.log(`Chain ${argv.chain} is not supported!`)
    } else {
      const balance = await client.getBalance({
        address: argv.address,
      })

      CliHelper.writeOutput({
        format: argv.output,
        filePath: argv.file,
        data: new BigNumber(balance.toString())
          .dividedBy(new BigNumber(10).pow(argv.decimals))
          .toString(10),
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
      decimals: {
        type: 'number',
        default: 0,
        describe: 'Format output with given decimals',
      },
    })
  }
}
