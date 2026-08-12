type RoleCountSummaryProps = {
  playerCount: number
  selectedRoleCount: number
}

export default function RoleCountSummary({
  playerCount,
  selectedRoleCount,
}: RoleCountSummaryProps) {
  const remainingCount = playerCount - selectedRoleCount
  const isValid = remainingCount === 0

  return (
    <div className={`grid gap-3 rounded-2xl border p-4 sm:grid-cols-3 ${isValid ? "border-[var(--ww-success)] bg-[color-mix(in_srgb,var(--ww-success)_10%,transparent)]" : "border-[var(--ww-border)] bg-[var(--ww-surface-2)]"}`}>
      <div>
        <p className="text-xs text-[var(--ww-text-3)]">Players</p>
        <p className="text-xl font-bold text-[var(--ww-text)]">{playerCount}</p>
      </div>
      <div>
        <p className="text-xs text-[var(--ww-text-3)]">Roles</p>
        <p className="text-xl font-bold text-[var(--ww-text)]">{selectedRoleCount}</p>
      </div>
      <div>
        <p className="text-xs text-[var(--ww-text-3)]">
          {isValid ? "Ready" : "Remaining"}
        </p>
        <p
          className={`text-xl font-bold ${
            isValid ? "text-[var(--ww-success)]" : "text-[var(--ww-error)]"
          }`}
        >
          {isValid ? "OK" : remainingCount}
        </p>
      </div>
    </div>
  )
}
