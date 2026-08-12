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
  { key: "price", labelKey: "compare.fields.price", emphasize: true },
  { key: "area", labelKey: "compare.fields.area" },
  { key: "rooms", labelKey: "compare.fields.rooms" },
  { key: "bathrooms", labelKey: "compare.fields.bathrooms" },
  { key: "type", labelKey: "compare.fields.type" },
  { key: "contract", labelKey: "compare.fields.contract" },
  { key: "city", labelKey: "compare.fields.city" },
  { key: "country", labelKey: "compare.fields.country" },
  { key: "status", labelKey: "compare.fields.status" },
  { key: "publisher", labelKey: "compare.fields.publisher" },
] as const