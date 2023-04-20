import { execa, type ExecaChildProcess } from 'execa'
import { Writable } from 'node:stream'

export interface AnvilOptions {
  portNumber: number
  forkUrl?: string | undefined
  forkBlockNumber?: number | bigint | undefined
  blockTime?: number
  startUpTimeout?: number
}

export class Anvil {
  public readonly options: AnvilOptions
  public readonly process: ExecaChildProcess
  private readonly controller: AbortController
  private readonly recorder: LogRecorder

  public static async start(options: AnvilOptions) {
    const opts = {
      startUpTimeout: 10000,
      ...options,
    }

    let resolve: (value: Anvil) => void = () => {}
    let reject: (reason: Error) => void = () => {}

    const resolvable = new Promise<Anvil>((resolve_, reject_) => {
      resolve = resolve_
      reject = reject_

      // If anvil fails to start up in time, we reject the promise.
      setTimeout(() => {
        let message = 'Anvil failed to start in time'
        const logs = recorder.flush()

        if (logs.length > 0) {
          message += `:\n\n${logs.join('\n')}}`
        }

        reject(new Error(message))
      }, opts.startUpTimeout)
    })

    const controller = new AbortController()
    const recorder = new LogRecorder((message) => {
      // We know that anvil has started up when it prints this message.
      if (message.includes(`Listening on 127.0.0.1:${opts.portNumber}`)) {
        resolve(instance)
      }
    })

    // TODO: We could expose a lot more options here. We could also extract this into a dedicated command builder.
    const args = Object.entries({
      '--port': `${opts.portNumber}`,
      ...(opts.forkUrl ? { '--fork-url': opts.forkUrl } : {}),
      ...(opts.forkBlockNumber
        ? { '--fork-block-number': `${Number(opts.forkBlockNumber)}` }
        : {}),
      ...(opts.blockTime ? { '--block-time': `${opts.blockTime}` } : {}),
    }).flatMap(([key, value]) => [key, value])

    const subprocess = execa('anvil', args, {
      signal: controller.signal,
      cleanup: true,
      all: true,
    })

    // Assign the anvil instance that is returned from the promise.
    const instance = new this(subprocess, controller, recorder, opts)

    subprocess.pipeAll!(recorder)
    subprocess.catch((error) => reject(error))

    return resolvable
  }

  constructor(
    subprocess: ExecaChildProcess,
    controller: AbortController,
    recorder: LogRecorder,
    options: AnvilOptions,
  ) {
    this.process = subprocess
    this.controller = controller
    this.recorder = recorder
    this.options = options
  }

  public async exit(reason?: string) {
    if (!this.controller.signal.aborted) {
      this.controller.abort(reason)
    }

    try {
      await this.process
    } catch {}
  }

  public get port() {
    return this.options.portNumber
  }

  public get logs() {
    return this.recorder.flush()
  }
}

class LogRecorder extends Writable {
  private readonly callback: (message: string) => void
  private readonly messages: string[] = []

  constructor(callback: (message: string) => void) {
    super()
    this.callback = callback
  }

  override _write(chunk: any, _: string, next: (error?: Error) => void) {
    const message = chunk.toString()
    this.messages.push(message)
    this.callback(message)
    next()
  }

  public flush() {
    return this.messages.splice(0, this.messages.length)
  }
}
