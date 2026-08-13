export type {
  Appointment,
  AppointmentCalendarEvent,
  AppointmentFilters,
  AppointmentProperty,
  AppointmentStatus,
  AppointmentType,
  AppointmentUser,
  AppointmentsResponse,
  ContactMethod,
  CreateAppointmentRequest,
  CreateFollowUpRequest,
  UpdateAppointmentStatusRequest,
  ViewingType,
} from "./types"

export {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  CONTACT_METHODS,
  VIEWING_TYPES,
} from "./types"

export {
  appointmentService,
  AppointmentsServiceError,
  emptyAppointments,
} from "./services/appointmentsService"

export {
  appointmentFiltersSchema,
  appointmentStatusSchema,
  appointmentTypeSchema,
  contactMethodSchema,
  createAppointmentSchema,
  createFollowUpSchema,
  updateAppointmentStatusSchema,
  viewingTypeSchema,
  type AppointmentFiltersValues,
  type CreateAppointmentValues,
  type CreateFollowUpValues,
  type UpdateAppointmentStatusValues,
} from "./schemas"

export {
  useAppointments,
  useAppointmentCalendar,
  type UseAppointmentsResult,
} from "./hooks/useAppointments"

export { AppointmentActions, getAppointmentStatusTone } from "./components/AppointmentActions"
export { AppointmentCalendar } from "./components/AppointmentCalendar"
export { AppointmentList } from "./components/AppointmentList"
export { StatusUpdateDialog } from "./components/StatusUpdateDialog"
