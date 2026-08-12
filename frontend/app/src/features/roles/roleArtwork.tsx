import { useState } from "react"

export const ROLE_IMAGE_BY_ID: Readonly<Record<string, string>> = {
  alpha_wolf: "/roles/alpha_wolf.webp",
  apprentice_seer: "/roles/apprentice_seer.webp",
  aura_seer: "/roles/aura_seer.webp",
  cult_leader: "/roles/cult_leader.webp",
  cupid: "/roles/cupid.webp",
  cursed: "/roles/cursed.webp",
  diseased: "/roles/diseased.webp",
  fruit_wolf: "/roles/fruit_wolf.webp",
  gambler: "/roles/gambler.webp",
  guard: "/roles/guard.webp",
  halfblood: "/roles/halfblood.webp",
  hoodlum: "/roles/hoodlum.webp",
  hunter: "/roles/hunter.webp",
  huntress: "/roles/huntress.webp",
  investigator: "/roles/investigator.webp",
  lone_wolf: "/roles/lone_wolf.webp",
  mayor: "/roles/mayor.webp",
  minion: "/roles/minion.webp",
  old_hag: "/roles/old_hag.webp",
  priest: "/roles/priest.webp",
  prince: "/roles/prince.webp",
  seer: "/roles/seer.webp",
  sorceress: "/roles/sorceress.webp",
  spellcaster: "/roles/spellcaster.webp",
  tanner: "/roles/tanner.webp",
  tough_guy: "/roles/tough_guy.webp",
  vampire: "/roles/vampire.webp",
  villager: "/roles/villager.webp",
  werewolf: "/roles/werewolf.webp",
  witch: "/roles/witch.webp",
  wolf_cub: "/roles/wolf_cub.webp",
}

export function getRoleImageUrl(roleId: string): string | null {
  return ROLE_IMAGE_BY_ID[roleId] ?? null
}

type RoleArtworkProps = Readonly<{
  roleId: string
  roleName: string
  className?: string
  eager?: boolean
}>

export function RoleArtwork({ roleId, roleName, className = "", eager = false }: RoleArtworkProps) {
  const [failed, setFailed] = useState(false)
  const source = getRoleImageUrl(roleId)

  if (!source || failed) {
    return (
      <span
        aria-label={`${roleName} artwork unavailable`}
        className={`grid place-items-center bg-[var(--ww-surface-3)] font-bold text-[var(--ww-text-2)] ${className}`}
        role="img"
      >
        {roleName.trim().charAt(0).toUpperCase() || "?"}
      </span>
    )
  }

  return (
    <img
      alt={roleName}
      className={`object-contain ${className}`}
      decoding="async"
      height={274}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      src={source}
      width={200}
    />
  )
}
