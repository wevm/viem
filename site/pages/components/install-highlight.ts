import { codeToHtml } from 'shiki'

import { shikiDark, shikiLight } from '../../shiki-themes'

const commands = {
  npm: 'npm install viem',
  pnpm: 'pnpm add viem',
  bun: 'bun add viem',
} as const

export type InstallPkg = keyof typeof commands

async function render(command: string) {
  return codeToHtml(command, {
    lang: 'sh',
    themes: { light: shikiLight, dark: shikiDark },
    defaultColor: false,
  })
}

export const installHtml: Record<InstallPkg, string> = Object.fromEntries(
  await Promise.all(
    (Object.keys(commands) as InstallPkg[]).map(async (pkg) => [
      pkg,
      await render(commands[pkg]),
    ]),
  ),
) as Record<InstallPkg, string>

export const installCommands = commands
