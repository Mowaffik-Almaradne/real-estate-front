/**
 * Maximum number of properties that can be compared at once.
 */
export const MAX_COMPARE_ITEMS = 4

/**
 * Comparison rows. The order of `COMPARISON_FIELDS` determines
 * the order in which the rows appear in the comparison table.
 */
export type ComparisonFieldKey =
  | "price"
  | "area"
  | "rooms"
  | "bathrooms"
  | "type"
  | "contract"
  | "city"
  | "country"
  | "status"
  | "publisher"

export interface ComparisonFieldDef {
  key: ComparisonFieldKey
  labelKey: string
  emphasize?: boolean
}

export const COMPARISON_FIELDS: readonly ComparisonFieldDef[] = [
  { key: "price", labelKey: "fields.price", emphasize: true },
  { key: "area", labelKey: "fields.area" },
  { key: "rooms", labelKey: "fields.rooms" },
  { key: "bathrooms", labelKey: "fields.bathrooms" },
  { key: "type", labelKey: "fields.type" },
  { key: "contract", labelKey: "fields.contract" },
  { key: "city", labelKey: "fields.city" },
  { key: "country", labelKey: "fields.country" },
  { key: "status", labelKey: "fields.status" },
  { key: "publisher", labelKey: "fields.publisher" },
] as const