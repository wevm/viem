import * as Gateway from '../../Gateway.js'
import * as Ndjson from '../../internal/ndjson.js'
import type { generateText } from './generateText.js'

/**
 * Generates text with a Gateway model and yields it as it is produced. Paid
 * per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * for await (const event of Actions.ai.streamText(gateway, {
 *   model: '@cf/zai-org/glm-5.3',
 *   prompt: 'Write a haiku about Tempo.',
 * })) {
 *   if (event.type === 'text') process.stdout.write(event.delta)
 * }
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns Text and reasoning deltas, then usage.
 */
export async function* streamText(
  gateway: Gateway.Gateway,
  options: streamText.Options,
): AsyncGenerator<streamText.Event> {
  const { maxOutputTokens, messages, model, prompt, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({
      maxOutputTokens,
      messages,
      model,
      prompt,
      stream: true,
    }),
    path: '/ai/generate',
    signal,
  })
  type Raw =
    | { delta: string; type: 'reasoning' | 'text' }
    | {
        type: 'done'
        usage: {
          completion_tokens?: number | undefined
          prompt_tokens?: number | undefined
          total_tokens?: number | undefined
        } | null
      }
  for await (const event of Ndjson.read<Raw>(response)) {
    if (event.type !== 'done') {
      yield event
      continue
    }
    yield {
      type: 'done',
      usage: event.usage
        ? {
            inputTokens: event.usage.prompt_tokens,
            outputTokens: event.usage.completion_tokens,
            totalTokens: event.usage.total_tokens,
          }
        : undefined,
    }
  }
}

export declare namespace streamText {
  type Options = generateText.Options

  type Event =
    | {
        /** Text produced since the previous event. */
        delta: string
        /** `text` for the answer, `reasoning` for the model's reasoning. */
        type: 'reasoning' | 'text'
      }
    | {
        type: 'done'
        /** Token usage, when the model reports it. */
        usage: generateText.ReturnType['usage']
      }

  type ErrorType = Gateway.request.ErrorType
}
