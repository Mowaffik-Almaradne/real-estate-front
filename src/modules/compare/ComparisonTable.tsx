"use client"

import { useTranslations } from "next-intl"

import { COMPARISON_FIELDS } from "./types"
import type { ComparisonFieldKey } from "./types"
import type { PropertyDto } from "@/types/dto"

interface ComparisonTableProps {
  properties: PropertyDto[]
}

interface CellValue {
  text: string
  best?: boolean
  worst?: boolean
}

function getValuesForField(
  properties: PropertyDto[],
  field: ComparisonFieldKey
): (string | number)[] {
  return properties.map((p) => {
    switch (field) {
      case "price":
        return Number(p.price)
      case "area":
        return Number(p.area)
      case "rooms":
        return p.rooms
      case "bathrooms":
        return p.bathrooms
      case "type":
        return p.property_type
      case "contract":
        return p.type_of_contract
      case "city":
        return p.city?.name ?? ""
      case "country":
        return p.country?.name ?? ""
      case "status":
        return p.status
      case "publisher":
        return p.publisher?.name ?? ""
      default:
        return ""
    }
  })
}

function findExtremes(
  values: (string | number)[]
): { best?: number; worst?: number } {
  if (values.length < 2) return {}
  const allNumeric = values.every((v) => typeof v === "number")
  if (!allNumeric) return {}
  const nums = values as number[]
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  if (min === max) return {}
  return { best: max, worst: min }
}

function cellValue(value: string | number, extremes: { best?: number; worst?: number }): CellValue {
  if (typeof value === "number") {
    return {
      text: value.toString(),
      best: extremes.best === value,
      worst: extremes.worst === value,
    }
  }
  return { text: value }
}

function formatRow(field: ComparisonFieldKey, value: string | number, locale: string): string {
  if (field === "price") {
    return new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value))
  }
  if (field === "area") {
    return `${value} m²`
  }
  return String(value)
}

export function ComparisonTable({ properties }: ComparisonTableProps) {
  const t = useTranslations("compare")
  const locale = typeof document !== "undefined" ? document.documentElement.lang : "en"

  return (
    <div className="overflow-x-auto" data-testid="compare-table">
      <table className="w-full border-collapse">
        <tbody>
          {COMPARISON_FIELDS.map((field) => {
            const values = getValuesForField(properties, field.key)
            const extremes = findExtremes(values)
            return (
              <tr
                key={field.key}
                className="border-b border-border last:border-b-0"
                data-testid={`compare-row-${field.key}`}
              >
                <th
                  scope="row"
                  className={`text-start text-sm font-medium text-muted-foreground p-3 align-top w-40 ${
                    field.emphasize ? "text-foreground font-semibold" : ""
                  }`}
                >
                  {t(field.labelKey)}
                </th>
                {values.map((value, idx) => {
                  const cell = cellValue(value, extremes)
                  const isPrice = field.key === "price"
                  return (
                    <td
                      key={properties[idx]?.id ?? idx}
                      className={`p-3 text-sm align-top ${
                        field.emphasize ? "font-semibold" : ""
                      } ${cell.best && isPrice ? "text-emerald-600 dark:text-emerald-400" : ""} ${
                        cell.worst && isPrice ? "text-red-600 dark:text-red-400" : ""
                      }`}
                    >
                      {formatRow(field.key, value, locale)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}