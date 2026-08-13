import { describe, it, expect, vi, beforeEach } from "vitest"

const getMock = vi.fn()
const postMock = vi.fn()
const patchMock = vi.fn()
const deleteMock = vi.fn()

vi.mock("@/lib/apiClient", async () => {
  const actual = await vi.importActual<typeof import("@/lib/apiClient")>("@/lib/apiClient")
  return {
    ...actual,
    apiClient: {
      get: (...args: unknown[]) => getMock(...args),
      post: (...args: unknown[]) => postMock(...args),
      patch: (...args: unknown[]) => patchMock(...args),
      delete: (...args: unknown[]) => deleteMock(...args),
    },
  }
})

import { rentalCardService } from "./rentalCardService"

describe("rentalCardService", () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    patchMock.mockReset()
    deleteMock.mockReset()
  })

  it("list hits /dashboard/rental-cards and unwraps data", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: [{ id: 1, status: "active" }],
        pagination: { total: 1, per_page: 15, current_page: 1, last_page: 1, from: 1, to: 1 },
      },
    })

    const result = await rentalCardService.list({ status: "active" })

    expect(getMock).toHaveBeenCalledWith(
      "/dashboard/rental-cards",
      expect.objectContaining({ params: expect.objectContaining({ status: "active" }) })
    )
    expect(result.data).toHaveLength(1)
    expect(result.pagination.total).toBe(1)
  })

  it("list omits empty params", async () => {
    getMock.mockResolvedValue({ data: { success: true, data: [] } })
    await rentalCardService.list({})
    expect(getMock).toHaveBeenCalledWith(
      "/dashboard/rental-cards",
      expect.objectContaining({ params: {} })
    )
  })

  it("getById uses path id", async () => {
    getMock.mockResolvedValue({
      data: { success: true, data: { id: 7, status: "active" } },
    })
    const result = await rentalCardService.getById(7)
    expect(getMock).toHaveBeenCalledWith("/dashboard/rental-cards/7", expect.any(Object))
    expect(result.id).toBe(7)
  })

  it("getActiveForProperty unwraps array or single object", async () => {
    getMock.mockResolvedValueOnce({
      data: { success: true, data: [] },
    })
    const empty = await rentalCardService.getActiveForProperty(5)
    expect(empty).toBeNull()

    getMock.mockResolvedValueOnce({
      data: {
        success: true,
        data: { id: 1, property_id: 5, status: "active" },
      },
    })
    const single = await rentalCardService.getActiveForProperty(5)
    expect(single?.id).toBe(1)
  })

  it("create sends multipart when photos are provided", async () => {
    const file = new File(["x"], "x.png", { type: "image/png" })
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "active" } },
    })

    await rentalCardService.create({
      property_id: 5,
      start_date: "2026-12-01",
      end_date: "2027-01-01",
      pre_rental_photos: [file],
    })

    expect(postMock).toHaveBeenCalledWith(
      "/dashboard/rental-cards",
      expect.any(FormData),
      expect.objectContaining({ headers: { "Content-Type": "multipart/form-data" } })
    )
  })

  it("create sends json when no photos are provided", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "active" } },
    })

    await rentalCardService.create({
      property_id: 5,
      start_date: "2026-12-01",
      end_date: "2027-01-01",
    })

    expect(postMock).toHaveBeenCalledWith(
      "/dashboard/rental-cards",
      expect.objectContaining({ property_id: 5 })
    )
  })

  it("update uses PATCH", async () => {
    patchMock.mockResolvedValue({
      data: { success: true, data: { id: 1, terms: "X" } },
    })
    await rentalCardService.update(1, { terms: "X", is_renewable: true })
    expect(patchMock).toHaveBeenCalledWith(
      "/dashboard/rental-cards/1",
      expect.objectContaining({ terms: "X", is_renewable: true })
    )
  })

  it("end uses PATCH on /end", async () => {
    patchMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "ended" } },
    })
    await rentalCardService.end(1, { end_reason: "Tenant moved" })
    expect(patchMock).toHaveBeenCalledWith(
      "/dashboard/rental-cards/1/end",
      expect.objectContaining({ end_reason: "Tenant moved" })
    )
  })

  it("renew requires end_date", async () => {
    patchMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "renewed" } },
    })
    await rentalCardService.renew(1, { end_date: "2027-12-01" })
    expect(patchMock).toHaveBeenCalledWith(
      "/dashboard/rental-cards/1/renew",
      expect.objectContaining({ end_date: "2027-12-01" })
    )
  })

  it("remove uses DELETE", async () => {
    deleteMock.mockResolvedValue({})
    await rentalCardService.remove(1)
    expect(deleteMock).toHaveBeenCalledWith("/dashboard/rental-cards/1")
  })

  it("getHistoryForProperty passes query params", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: [],
        pagination: { total: 0, per_page: 15, current_page: 1, last_page: 1, from: null, to: null },
      },
    })
    await rentalCardService.getHistoryForProperty(5, { page: 2, perPage: 5 })
    expect(getMock).toHaveBeenCalledWith(
      "/dashboard/properties/5/rental-cards/history",
      expect.objectContaining({ params: expect.objectContaining({ page: 2, perPage: 5 }) })
    )
  })
})
