import * as Gateway from '../Gateway.js'

/**
 * Embeds text with a Gateway model. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({
 *   app: 'my-app',
 *   fetch: mppx.fetch,
 *   url: 'https://gateway.example.com',
 * })
 *
 * const { embeddings } = await Actions.ai.embed(gateway, {
 *   input: ['hello world'],
 *   model: '@cf/baai/bge-base-en-v1.5',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The embeddings and their shape.
 */
export async function embed(
  gateway: Gateway.Gateway,
  parameters: embed.Parameters,
): Promise<embed.ReturnValue> {
  const { input, model, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({
      input: typeof input === 'string' ? [input] : input,
      model,
    }),
    path: '/ai/embed',
    signal,
  })
  return (await response.json()) as embed.ReturnValue
}

export declare namespace embed {
  type Parameters = {
    /** Text or texts to embed. */
    input: string | readonly string[]
    /** Embedding model. See `Gateway.getCapabilities`. */
    model: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnValue = {
    /** One embedding per input. */
    embeddings: readonly (readonly number[])[]
    /** Shape of `embeddings`. */
    shape: readonly number[]
  }

  type ErrorType = Gateway.request.ErrorType
}

/**
 * Generates text with a Gateway model. Paid per request.
 *
 * Pass either `prompt` or `messages`.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({
 *   app: 'my-app',
 *   fetch: mppx.fetch,
 *   url: 'https://gateway.example.com',
 * })
 *
 * const { text } = await Actions.ai.generateText(gateway, {
 *   model: '@cf/meta/llama-3.1-8b-instruct',
 *   prompt: 'Describe this app in one sentence.',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param parameters - Parameters.
 * @returns The generated text and token usage.
 */
export async function generateText(
  gateway: Gateway.Gateway,
  parameters: generateText.Parameters,
): Promise<generateText.ReturnValue> {
  const { maxOutputTokens, messages, model, prompt, signal } = parameters
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ maxOutputTokens, messages, model, prompt }),
    path: '/ai/generate',
    signal,
  })
  type Body = {
    text: string
    usage: {
      completion_tokens?: number | undefined
      prompt_tokens?: number | undefined
      total_tokens?: number | undefined
    } | null
  }
  const { text, usage } = (await response.json()) as Body
  return {
    text,
    usage: usage
      ? {
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        }
      : undefined,
  }
}

export declare namespace generateText {
  type Message = {
    /** Message text. */
    content: string
    /** Message author. */
    role: 'assistant' | 'system' | 'user'
  }

  type Parameters = {
    /** Maximum generated tokens. */
    maxOutputTokens?: number | undefined
    /** Generation model. See `Gateway.getCapabilities`. */
    model: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  } & (
    | {
        /** Conversation to continue. */
        messages: readonly Message[]
        prompt?: undefined
      }
    | {
        messages?: undefined
        /** Prompt to complete. */
        prompt: string
      }
  )

  type ReturnValue = {
    /** Generated text. */
    text: string
    /** Token usage, when the model reports it. */
    usage:
      | {
          /** Prompt tokens. */
          inputTokens: number | undefined
          /** Generated tokens. */
          outputTokens: number | undefined
          /** Total tokens. */
          totalTokens: number | undefined
        }
      | undefined
  }

  type ErrorType = Gateway.request.ErrorType
}

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
 * const gateway = Gateway.from({
 *   app: 'my-app',
 *   fetch: mppx.fetch,
 *   url: 'https://gateway.example.com',
 * })
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
 * @param parameters - Parameters.
 * @returns Text and reasoning deltas, then usage.
 */
export async function* streamText(
  gateway: Gateway.Gateway,
  parameters: streamText.Parameters,
): AsyncGenerator<streamText.Event> {
  const { maxOutputTokens, messages, model, prompt, signal } = parameters
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
  for await (const event of Gateway.events<Raw>(response)) {
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
  type Parameters = generateText.Parameters

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
        usage: generateText.ReturnValue['usage']
      }

  type ErrorType = Gateway.request.ErrorType
}
