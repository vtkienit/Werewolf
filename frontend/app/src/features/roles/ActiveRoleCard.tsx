import { Moon, Shield, Sparkles } from "lucide-react"
import { characters } from "../../data/characters"
import { RoleArtwork } from "./roleArtwork"
import { useLanguage } from "../../contexts/LanguageProvider"
import { localizedCharacterAbility } from "../../data/characterEnglishCopy"

export default function ActiveRoleCard({ roleId, fallbackName, quantity }: { roleId: string; fallbackName: string; quantity: number }) {
  const { lang, translate } = useLanguage()
  const role = characters.find(character => character.id === roleId)
  const name = role ? (lang === "en" ? role.nameEn || role.name : role.name) : fallbackName
  const secondaryName = role ? (lang === "en" ? role.name : role.nameEn) : null
  const factionLabels: Record<string, string> = { village: translate("Dân làng", "Village"), werewolf: translate("Sói", "Werewolves"), vampire: translate("Ma cà rồng", "Vampires"), other: translate("Khác", "Other") }
  const phaseLabels: Record<string, string> = { every: translate("Mỗi đêm", "Every night"), night1: translate("Đêm đầu", "First night") }
  const Icon = role?.team === "werewolf" ? Moon : role?.team === "village" ? Shield : Sparkles
  return (
    <article className="ww-active-role-card">
      <div className="ww-active-role-card__art">
        <RoleArtwork roleId={roleId} roleName={name} className="h-28 w-24 object-contain sm:h-32 sm:w-28" />
        <span className="ww-active-role-card__quantity" aria-label={`${translate("Số lượng", "Quantity")} ${quantity}`}>×{quantity}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black leading-tight text-[var(--ww-text)]">{name}</h3>
            {secondaryName && secondaryName !== name && <p className="mt-1 text-xs text-[var(--ww-text-3)]">{secondaryName}</p>}
          </div>
          <Icon aria-hidden="true" className="shrink-0 text-[var(--ww-gold)]" size={18} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`ww-role-badge ww-role-badge--${role?.team ?? "other"}`}>{factionLabels[role?.team ?? "other"] ?? translate("Khác", "Other")}</span>
          {role?.wakesAtNight && <span className="ww-role-badge ww-role-badge--night">{phaseLabels[role.phase] ?? translate("Ban đêm", "Night")}</span>}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--ww-text-2)]">{role ? localizedCharacterAbility(role, lang) : translate("Thông tin vai trò sẽ được Host cung cấp.", "Role details will be provided by the Host.")}</p>
      </div>
    </article>
  )
}
