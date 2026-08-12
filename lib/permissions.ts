import type { UserDto } from "@/types/dto"

export type PermissionName =
  | "properties.list"
  | "properties.create"
  | "properties.edit"
  | "properties.delete"
  | "cities.list"
  | "cities.create"
  | "users.list"
  | "roles.list"
  | "ads.list"
  | "viewings.list"
  | "subscription_plans.list"
  | (string & {})

export function isSuperAdmin(user: UserDto | null): boolean {
  return user?.roles?.some((role) => role.name === "super-admin") ?? false
}

export function getUserPermissions(user: UserDto | null): string[] {
  if (!user) return []
  return user.roles?.flatMap((role) => role.permissions?.map((permission) => permission.name) ?? []) ?? []
}

export function hasPermission(user: UserDto | null, permission: PermissionName): boolean {
  if (!user) return false
  if (isSuperAdmin(user)) return true

  if (user.roles === undefined || user.roles.length === 0) return true
  return getUserPermissions(user).includes(permission)
}

export function hasAnyPermission(user: UserDto | null, permissions: PermissionName[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission))
}
