import { describe, it, expect } from "vitest"
import {
  filterToParams,
  sortFilters,
  type PropertyFilters,
} from "./propertyService"
import { PropertyStatus, PropertyType, TypeOfContract } from "@/types/enums"

describe("sortFilters", () => {
  it("returns the filters unchanged when sort_by and sort_order are set", () => {
    const filters: PropertyFilters = { sort_by: "price", sort_order: "asc" }
    expect(sortFilters(filters)).toEqual(filters)
  })

  it("expands a combined sort string", () => {
    const result = sortFilters({ sort_by: "price:desc" } as PropertyFilters)
    expect(result.sort_by).toBe("price")
    expect(result.sort_order).toBe("desc")
  })

  it("falls back to created_at desc when nothing is set", () => {
    const result = sortFilters({})
    expect(result.sort_by).toBe("created_at")
    expect(result.sort_order).toBe("desc")
  })
})

describe("filterToParams", () => {
  it("drops empty values", () => {
    const params = filterToParams({
      search: "",
      country_id: undefined,
      sort_by: "price",
      sort_order: "asc",
    })
    expect(params).toEqual({ sort_by: "price", sort_order: "asc" })
  })

  it("stringifies numbers and enums", () => {
    const params = filterToParams({
      country_id: 5,
      city_id: 12,
      min_price: 100,
      max_price: 1000,
      property_type: PropertyType.apartment,
      type_of_contract: TypeOfContract.rent,
      status: PropertyStatus.approved,
      page: 2,
      per_page: 20,
      sort_by: "price",
      sort_order: "asc",
    })
    expect(params).toEqual({
      country_id: "5",
      city_id: "12",
      min_price: "100",
      max_price: "1000",
      property_type: "apartment",
      type_of_contract: "rent",
      status: "approved",
      page: "2",
      per_page: "20",
      sort_by: "price",
      sort_order: "asc",
    })
  })
})
