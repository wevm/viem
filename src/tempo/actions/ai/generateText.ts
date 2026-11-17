import * as Gateway from '../../Gateway.js'

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
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const { text } = await Actions.ai.generateText(gateway, {
 *   model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
 *   prompt: 'Describe this app in one sentence.',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The generated text and token usage.
 */
export async function generateText(
  gateway: Gateway.Gateway,
  options: generateText.Options,
): Promise<generateText.ReturnType> {
  const { maxOutputTokens, messages, model, prompt, signal } = options
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

  type Options = {
    /**
     * Maximum generated tokens. The request reserves their cost and refunds
     * what is not generated.
     */
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

  type ReturnType = {
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
