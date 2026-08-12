import type { GameSetupRole, RoleQuantityMap } from "../types/gameSetup.types"
import type { RoleQuantity } from "../../game-distribution"

export function getSelectedRoleTotal(quantities: RoleQuantityMap) {
  return Object.values(quantities).reduce((total, quantity) => {
    return total + Math.max(0, quantity)
  }, 0)
}

export type RoleSetupValidation = Readonly<{
  valid: boolean
  total: number
  message: string
}>

export function validateRoleSetup(roles: GameSetupRole[], quantities: RoleQuantityMap): RoleSetupValidation {
  const supportedRoles = new Map(roles.map(role => [role.roleId, role]))
  for (const [roleId, quantity] of Object.entries(quantities)) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      const name = supportedRoles.get(roleId)?.name ?? roleId
      return { valid: false, total: getSelectedRoleTotal(quantities), message: `Số lượng vai ${name} không hợp lệ.` }
    }
    if (quantity === 0) continue
    const role = supportedRoles.get(roleId)
    if (!role) return { valid: false, total: getSelectedRoleTotal(quantities), message: `Vai trò ${roleId} không được hỗ trợ.` }
    const maximum = role.maxQuantity ?? 1
    if (quantity > maximum) return { valid: false, total: getSelectedRoleTotal(quantities), message: `${role.name} chỉ hỗ trợ tối đa ${maximum}.` }
  }

  const total = getSelectedRoleTotal(quantities)
  if (total < 6) return { valid: false, total, message: "Cần chọn ít nhất 6 vai trò." }
  if (total > 12) return { valid: false, total, message: "Chỉ được chọn tối đa 12 vai trò." }
  return { valid: true, total, message: "Chọn từ 6 đến 12 vai trò hợp lệ để xác nhận thiết lập." }
}

export function isRoleSetupValid(roles: GameSetupRole[], quantities: RoleQuantityMap) {
  return validateRoleSetup(roles, quantities).valid
}

export function isConfirmedSetupValidForPlayers(roles: GameSetupRole[], quantities: RoleQuantityMap, playerCount: number) {
  const validation = validateRoleSetup(roles, quantities)
  return validation.valid && validation.total === playerCount
}

export function toPlayGameRoles(
  roles: GameSetupRole[],
  quantities: RoleQuantityMap,
): RoleQuantity[] {
  return roles
    .map((role) => ({
      roleId: role.roleId,
      quantity: Math.max(0, quantities[role.roleId] ?? 0),
    }))
    // Frontend chi gui role da chon de payload gon hon.
    .filter((role) => role.quantity > 0)
}
