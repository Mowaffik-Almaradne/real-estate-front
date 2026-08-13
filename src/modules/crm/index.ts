export type {
  CrmDashboardSummary,
  CrmTodaySnapshot,
  CreateLeadNoteRequest,
  CreateLeadRequest,
  Lead,
  LeadDuplicateMatch,
  LeadDuplicateResult,
  LeadFilters,
  LeadNote,
  LeadSource,
  LeadStatus,
  LeadsResponse,
  UpdateLeadNoteRequest,
  UpdateLeadRequest,
  UpdateLeadStatusRequest,
} from "./types"

export { LEAD_SOURCES, LEAD_STATUSES } from "./types"

export {
  crmDashboardService,
  leadNoteService,
  leadService,
  CrmServiceError,
} from "./services/crmService"

export {
  createLeadNoteSchema,
  createLeadSchema,
  leadFiltersSchema,
  leadSourceSchema,
  leadStatusSchema,
  updateLeadNoteSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  type CreateLeadNoteValues,
  type CreateLeadValues,
  type LeadFiltersValues,
  type UpdateLeadNoteValues,
  type UpdateLeadStatusValues,
  type UpdateLeadValues,
} from "./schemas"

export { useLeadNotes, type UseLeadNotesResult } from "./hooks/useLeadNotes"
export { useLeads, type UseLeadsResult } from "./hooks/useLeads"

export { CrmSummary } from "./components/CrmSummary"
export { CreateLeadDialog } from "./components/CreateLeadDialog"
export { LeadDetailDialog } from "./components/LeadDetailDialog"
export { LeadForm } from "./components/LeadForm"
export { LeadList } from "./components/LeadList"
