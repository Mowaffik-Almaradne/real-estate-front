import { describe, it, expect } from "vitest"
import {
  canTransitionPropertyStatus,
  canTransitionServiceRequestStatus,
  canTransitionViewingStatus,
  PropertyStatus,
  ServiceRequestStatus,
  ViewingStatus,
} from "@/types/enums"

describe("status transitions", () => {
  it("allows valid property transitions", () => {
    expect(canTransitionPropertyStatus(PropertyStatus.pending, PropertyStatus.approved)).toBe(true)
    expect(canTransitionPropertyStatus(PropertyStatus.approved, PropertyStatus.sold)).toBe(true)
  })

  it("blocks invalid property transitions", () => {
    expect(canTransitionPropertyStatus(PropertyStatus.sold, PropertyStatus.approved)).toBe(false)
    expect(canTransitionPropertyStatus(PropertyStatus.archived, PropertyStatus.approved)).toBe(false)
  })

  it("enforces viewing lifecycle", () => {
    expect(canTransitionViewingStatus(ViewingStatus.confirmed, ViewingStatus.completed)).toBe(true)
    expect(canTransitionViewingStatus(ViewingStatus.completed, ViewingStatus.cancelled)).toBe(false)
  })

  it("enforces service request transitions", () => {
    expect(canTransitionServiceRequestStatus(ServiceRequestStatus.pending, ServiceRequestStatus.accepted)).toBe(true)
    expect(canTransitionServiceRequestStatus(ServiceRequestStatus.completed, ServiceRequestStatus.cancelled)).toBe(false)
  })
})
