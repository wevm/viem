export * from 'ox/Siwe'

import * as Siwe from 'ox/Siwe'

export const schemeRegex = /^([a-zA-Z][a-zA-Z0-9+.-]*)$/

export const prefixRegex =
  /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+.-]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/

/** Creates an EIP-4361 message with an RFC 3986 scheme. */
export function createMessage(value: Siwe.Message): string {
  if (value.scheme && !schemeRegex.test(value.scheme))
    throw new Siwe.InvalidMessageFieldError({
      field: 'scheme',
      metaMessages: [
        '- Scheme must be an RFC 3986 URI scheme.',
        '- See https://www.rfc-editor.org/rfc/rfc3986#section-3.1',
        '',
        `Provided value: ${value.scheme}`,
      ],
    })
  return Siwe.createMessage(value)
}

/** Parses an EIP-4361 message, omitting prefixes with invalid schemes. */
export function parseMessage(
  message: string,
): ReturnType<typeof Siwe.parseMessage> {
  const parsed = Siwe.parseMessage(message)
  if (parsed.scheme && !schemeRegex.test(parsed.scheme)) {
    delete parsed.scheme
    delete parsed.domain
    delete parsed.address
    delete parsed.statement
  }
  return parsed
}
