import { sponsors } from '../../vocs.config'

const sponsorsUrl =
  'https://raw.githubusercontent.com/wevm/.github/main/content/sponsors'

function getSlug(sponsor: { name: string; slug?: string }) {
  return sponsor.slug ?? sponsor.name.toLowerCase()
}

type Sponsor = { name: string; slug?: string; url: string }

const heights = {
  small: 'h-[36px]',
  medium: 'h-[54px]',
  large: 'h-[81px]',
}

function SponsorLink({
  sponsor,
  size = 'small',
}: {
  sponsor: Sponsor
  size?: 'small' | 'medium' | 'large'
}) {
  const slug = getSlug(sponsor)
  const height = heights[size]
  const isLocal = slug === 'tempo'
  const baseUrl = isLocal ? '/sponsors' : sponsorsUrl
  return (
    <a href={sponsor.url} target="_blank" rel="noreferrer noopener">
      <picture>
        <source
          media="(prefers-color-scheme: dark)"
          srcSet={`${baseUrl}/${slug}-dark.svg`}
        />
        <img
          alt={sponsor.name}
          className={`${height} brightness-0 dark:invert`}
          src={`${baseUrl}/${slug}-light.svg`}
        />
      </picture>
    </a>
  )
}

function EmptySlot() {
  return (
    <a
      href="https://github.com/sponsors/wevm"
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center justify-center h-[32px] w-[32px] rounded-full border border-dashed border-black/20 dark:border-white/20"
    >
      <span className="text-black/30 dark:text-white/30 text-[18px] -mt-0.5">
        +
      </span>
      <span className="sr-only">Become a sponsor</span>
    </a>
  )
}

export function Sponsors() {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-[15px] text-[#919193] mb-4">Collaborator</div>
        <div className="flex flex-wrap gap-8 items-center">
          {sponsors.collaborators.map((sponsor) => (
            <SponsorLink
              key={sponsor.name}
              sponsor={sponsor as Sponsor}
              size="large"
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-[15px] text-[#919193] mb-4">Large Enterprise</div>
        <div className="flex flex-wrap gap-6 items-center">
          {sponsors.largeEnterprise.map((sponsor) => (
            <SponsorLink
              key={sponsor.name}
              sponsor={sponsor as Sponsor}
              size="medium"
            />
          ))}
          <EmptySlot />
        </div>
      </div>

      <div>
        <div className="text-[15px] text-[#919193] mb-4">Small Enterprise</div>
        <div className="flex flex-wrap gap-6 items-center">
          {sponsors.smallEnterprise.map((sponsor) => (
            <SponsorLink key={sponsor.name} sponsor={sponsor as Sponsor} />
          ))}
          <EmptySlot />
        </div>
      </div>
    </div>
  )
}
