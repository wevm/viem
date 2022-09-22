import { ViemLogo } from './ViemLogo'

export function Header() {
  return (
    <div className="flex flex-col items-center mt-10">
      <span>
        <ViemLogo />
      </span>
      <p className="text-lg mb-2 text-gray-600 md:!text-2xl mt-4">
        TypeScript Interface for Ethereum
      </p>
    </div>
  )
}
