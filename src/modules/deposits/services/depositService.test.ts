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

import { depositService } from "./depositService"

describe("depositService", () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    patchMock.mockReset()
    deleteMock.mockReset()
  })

  it("listMine hits /dashboard/my-deposits", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        data: [{ id: 1, status: "pending" }],
        pagination: { total: 1, per_page: 15, current_page: 1, last_page: 1, from: 1, to: 1 },
      },
    })
    const result = await depositService.listMine({ status: "pending" })
    expect(getMock).toHaveBeenCalledWith(
      "/dashboard/my-deposits",
      expect.objectContaining({ params: expect.objectContaining({ status: "pending" }) })
    )
    expect(result.data).toHaveLength(1)
  })

  it("listSales hits /dashboard/my-sales", async () => {
    getMock.mockResolvedValue({
      data: { success: true, data: [] },
    })
    await depositService.listSales()
    expect(getMock).toHaveBeenCalledWith(
      "/dashboard/my-sales",
      expect.any(Object)
    )
  })

  it("getById uses path id", async () => {
    getMock.mockResolvedValue({
      data: { success: true, data: { id: 7, status: "held" } },
    })
    const result = await depositService.getById(7)
    expect(getMock).toHaveBeenCalledWith("/dashboard/deposits/7", expect.any(Object))
    expect(result.id).toBe(7)
  })

  it("create posts to /dashboard/deposits", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "pending" } },
    })
    await depositService.create({
      property_id: 5,
      seller_id: 9,
      amount: 1000,
      currency: "SAR",
      terms: "Refundable",
    })
    expect(postMock).toHaveBeenCalledWith(
      "/dashboard/deposits",
      expect.objectContaining({
        property_id: 5,
        seller_id: 9,
        amount: 1000,
        currency: "SAR",
      })
    )
  })

  it("create omits empty strings", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "pending" } },
    })
    await depositService.create({
      property_id: 5,
      seller_id: 9,
      amount: 1000,
    })
    const payload = postMock.mock.calls[0][1] as Record<string, unknown>
    expect("terms" in payload).toBe(false)
    expect("notes" in payload).toBe(false)
  })

  it("update patches only provided fields", async () => {
    patchMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "pending" } },
    })
    await depositService.update(1, { amount: 2000 })
    expect(patchMock).toHaveBeenCalledWith(
      "/dashboard/deposits/1",
      expect.objectContaining({ amount: 2000 })
    )
  })

  it("remove deletes", async () => {
    deleteMock.mockResolvedValue({})
    await depositService.remove(1)
    expect(deleteMock).toHaveBeenCalledWith("/dashboard/deposits/1")
  })

  it("pay posts payment_method", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "held" } },
    })
    await depositService.pay(1, { payment_method: "balance" })
    expect(postMock).toHaveBeenCalledWith(
      "/dashboard/deposits/1/pay",
      expect.objectContaining({ payment_method: "balance" })
    )
  })

  it("release posts optional notes", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "released" } },
    })
    await depositService.release(1, { notes: "OK" })
    expect(postMock).toHaveBeenCalledWith(
      "/dashboard/deposits/1/release",
      expect.objectContaining({ notes: "OK" })
    )
  })

  it("release omits empty notes", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "released" } },
    })
    await depositService.release(1)
    const payload = postMock.mock.calls[0][1] as Record<string, unknown>
    expect(Object.keys(payload)).toHaveLength(0)
  })

  it("refund posts optional notes", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "refunded" } },
    })
    await depositService.refund(1, { notes: "Cancel" })
    expect(postMock).toHaveBeenCalledWith(
      "/dashboard/deposits/1/refund",
      expect.objectContaining({ notes: "Cancel" })
    )
  })

  it("cancel posts reason", async () => {
    postMock.mockResolvedValue({
      data: { success: true, data: { id: 1, status: "cancelled" } },
    })
    await depositService.cancel(1, { reason: "Buyer no longer interested" })
    expect(postMock).toHaveBeenCalledWith(
      "/dashboard/deposits/1/cancel",
      expect.objectContaining({ reason: "Buyer no longer interested" })
    )
  })
})
