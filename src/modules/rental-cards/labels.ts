import type { Locale } from "@/i18n/config"
import { RentalCardStatus } from "./types/enums"

type LocaleLabels = Record<string, string>

const enLabels: LocaleLabels = {
  "rentalCards.title": "Rental Cards",
  "rentalCards.subtitle":
    "Manage active rentals, renewals, and historical contracts for your properties.",
  "rentalCards.create": "Create rental card",
  "rentalCards.list.title": "My rental cards",
  "rentalCards.list.empty.title": "No rental cards yet",
  "rentalCards.list.empty.description":
    "Create a rental card to mark a property as rented and track the tenant.",
  "rentalCards.list.loading": "Loading rental cards…",
  "rentalCards.list.errorTitle": "Could not load rental cards",
  "rentalCards.filter.status": "Status",
  "rentalCards.filter.statusAll": "All statuses",
  "rentalCards.filter.search": "Search (tenant, notes)",
  "rentalCards.filter.searchPlaceholder": "Search by tenant or note",
  "rentalCards.filter.propertyId": "Property ID",
  "rentalCards.filter.from": "Start date from",
  "rentalCards.filter.to": "End date to",
  "rentalCards.filter.reset": "Reset",
  "rentalCards.filter.apply": "Apply",
  "rentalCards.status.active": "Active",
  "rentalCards.status.ended": "Ended",
  "rentalCards.status.cancelled": "Cancelled",
  "rentalCards.status.renewed": "Renewed",
  "rentalCards.fields.property": "Property",
  "rentalCards.fields.tenant": "Tenant",
  "rentalCards.fields.tenantKind.registered": "Registered user",
  "rentalCards.fields.tenantKind.external": "External tenant",
  "rentalCards.fields.tenantUserId": "Tenant user ID",
  "rentalCards.fields.externalName": "External tenant name",
  "rentalCards.fields.externalPhone": "External tenant phone",
  "rentalCards.fields.externalEmail": "External tenant email",
  "rentalCards.fields.externalNotes": "External tenant ID notes",
  "rentalCards.fields.startDate": "Start date",
  "rentalCards.fields.endDate": "End date",
  "rentalCards.fields.terms": "Terms",
  "rentalCards.fields.notes": "Notes",
  "rentalCards.fields.isRenewable": "Renewable",
  "rentalCards.fields.preRentalPhotos": "Pre-rental photos",
  "rentalCards.fields.preRentalPhotosHint":
    "Up to 20 images (jpeg/png/webp, 5 MB each).",
  "rentalCards.fields.endedAt": "Ended at",
  "rentalCards.fields.endReason": "End reason",
  "rentalCards.fields.renewedTo": "Renew until",
  "rentalCards.fields.createdAt": "Created",
  "rentalCards.fields.renewalCount": "Renewals",
  "rentalCards.actions.end": "End rental",
  "rentalCards.actions.renew": "Renew",
  "rentalCards.actions.edit": "Edit",
  "rentalCards.actions.delete": "Delete",
  "rentalCards.actions.view": "View details",
  "rentalCards.actions.confirmEnd": "End this rental?",
  "rentalCards.actions.confirmDelete": "Delete this rental card?",
  "rentalCards.actions.confirmDeleteDescription":
    "Only non-active rental cards can be deleted. This action cannot be undone.",
  "rentalCards.createDialog.title": "Create rental card",
  "rentalCards.createDialog.description":
    "Mark a property as rented and attach tenant information.",
  "rentalCards.updateDialog.title": "Update rental card",
  "rentalCards.endDialog.title": "End rental",
  "rentalCards.endDialog.description":
    "The card will be marked as ended and the property will return to approved status.",
  "rentalCards.renewDialog.title": "Renew rental",
  "rentalCards.renewDialog.description":
    "Extend the end date and increment the renewal counter.",
  "rentalCards.errors.missingTenant":
    "Provide either a registered tenant user ID or an external tenant name.",
  "rentalCards.errors.endBeforeStart": "End date must be after start date.",
  "rentalCards.errors.pastStartDate": "Start date cannot be in the past.",
  "rentalCards.errors.tooManyPhotos": "You can attach up to 20 photos.",
  "rentalCards.errors.photoTooLarge": "Each photo must be 5 MB or smaller.",
  "rentalCards.errors.photoType":
    "Only JPEG, PNG, or WEBP images are accepted.",
  "rentalCards.errors.endNotActive": "This rental card is not active.",
  "rentalCards.errors.notRenewable": "This rental card is not marked as renewable.",
  "rentalCards.errors.deleteActive":
    "Active rental cards cannot be deleted. End it first.",
  "rentalCards.errors.propertyUnavailable":
    "This property is not available for renting.",
  "rentalCards.errors.endBeforeToday": "End date cannot be in the future.",
  "rentalCards.toast.created": "Rental card has been created successfully.",
  "rentalCards.toast.updated": "Rental card has been updated successfully.",
  "rentalCards.toast.ended": "Rental card has been ended.",
  "rentalCards.toast.renewed": "Rental card has been renewed.",
  "rentalCards.toast.deleted": "Rental card deleted successfully.",
  "rentalCards.toast.createFailed": "Could not create rental card.",
  "rentalCards.toast.updateFailed": "Could not update rental card.",
  "rentalCards.toast.endFailed": "Could not end rental card.",
  "rentalCards.toast.renewFailed": "Could not renew rental card.",
  "rentalCards.toast.deleteFailed": "Could not delete rental card.",
  "rentalCards.permission.denied":
    "Your account is missing the {permission} permission, so this API returns 403.",
}

const arLabels: LocaleLabels = {
  "rentalCards.title": "بطاقات الإيجار",
  "rentalCards.subtitle":
    "إدارة عقود الإيجار النشطة والتجديدات والسجل التاريخي للعقارات.",
  "rentalCards.create": "إنشاء بطاقة إيجار",
  "rentalCards.list.title": "بطاقات الإيجار الخاصة بي",
  "rentalCards.list.empty.title": "لا توجد بطاقات إيجار حتى الآن",
  "rentalCards.list.empty.description":
    "أنشئ بطاقة إيجار لتعليم العقار كمؤجر ومتابعة المستأجر.",
  "rentalCards.list.loading": "جارٍ تحميل بطاقات الإيجار…",
  "rentalCards.list.errorTitle": "تعذر تحميل بطاقات الإيجار",
  "rentalCards.filter.status": "الحالة",
  "rentalCards.filter.statusAll": "جميع الحالات",
  "rentalCards.filter.search": "البحث (المستأجر، الملاحظات)",
  "rentalCards.filter.searchPlaceholder": "ابحث بالمستأجر أو الملاحظة",
  "rentalCards.filter.propertyId": "معرّف العقار",
  "rentalCards.filter.from": "تاريخ البدء من",
  "rentalCards.filter.to": "تاريخ الانتهاء إلى",
  "rentalCards.filter.reset": "إعادة تعيين",
  "rentalCards.filter.apply": "تطبيق",
  "rentalCards.status.active": "نشط",
  "rentalCards.status.ended": "منتهية",
  "rentalCards.status.cancelled": "ملغاة",
  "rentalCards.status.renewed": "مجددة",
  "rentalCards.fields.property": "العقار",
  "rentalCards.fields.tenant": "المستأجر",
  "rentalCards.fields.tenantKind.registered": "مستخدم مسجل",
  "rentalCards.fields.tenantKind.external": "مستأجر خارجي",
  "rentalCards.fields.tenantUserId": "معرّف المستأجر",
  "rentalCards.fields.externalName": "اسم المستأجر الخارجي",
  "rentalCards.fields.externalPhone": "هاتف المستأجر الخارجي",
  "rentalCards.fields.externalEmail": "بريد المستأجر الخارجي",
  "rentalCards.fields.externalNotes": "ملاحظات هوية المستأجر الخارجي",
  "rentalCards.fields.startDate": "تاريخ البدء",
  "rentalCards.fields.endDate": "تاريخ الانتهاء",
  "rentalCards.fields.terms": "الشروط",
  "rentalCards.fields.notes": "ملاحظات",
  "rentalCards.fields.isRenewable": "قابل للتجديد",
  "rentalCards.fields.preRentalPhotos": "صور قبل الإيجار",
  "rentalCards.fields.preRentalPhotosHint":
    "حتى 20 صورة (jpeg/png/webp، 5 ميجابايت لكل صورة).",
  "rentalCards.fields.endedAt": "تاريخ الانتهاء الفعلي",
  "rentalCards.fields.endReason": "سبب الإنهاء",
  "rentalCards.fields.renewedTo": "التجديد حتى",
  "rentalCards.fields.createdAt": "تاريخ الإنشاء",
  "rentalCards.fields.renewalCount": "عدد التجديدات",
  "rentalCards.actions.end": "إنهاء الإيجار",
  "rentalCards.actions.renew": "تجديد",
  "rentalCards.actions.edit": "تعديل",
  "rentalCards.actions.delete": "حذف",
  "rentalCards.actions.view": "عرض التفاصيل",
  "rentalCards.actions.confirmEnd": "إنهاء هذا الإيجار؟",
  "rentalCards.actions.confirmDelete": "حذف بطاقة الإيجار هذه؟",
  "rentalCards.actions.confirmDeleteDescription":
    "لا يمكن حذف بطاقات الإيجار النشطة. لا يمكن التراجع عن هذا الإجراء.",
  "rentalCards.createDialog.title": "إنشاء بطاقة إيجار",
  "rentalCards.createDialog.description":
    "اجعل العقار مؤجرًا وأضف بيانات المستأجر.",
  "rentalCards.updateDialog.title": "تحديث بطاقة الإيجار",
  "rentalCards.endDialog.title": "إنهاء الإيجار",
  "rentalCards.endDialog.description":
    "سيتم وضع علامة على البطاقة كمنتهية وسيعود العقار إلى الحالة المعتمدة.",
  "rentalCards.renewDialog.title": "تجديد الإيجار",
  "rentalCards.renewDialog.description":
    "تمديد تاريخ الانتهاء وزيادة عداد التجديد.",
  "rentalCards.errors.missingTenant":
    "يجب إدخال معرّف مستأجر مسجل أو اسم مستأجر خارجي.",
  "rentalCards.errors.endBeforeStart": "يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء.",
  "rentalCards.errors.pastStartDate": "لا يمكن أن يكون تاريخ البدء في الماضي.",
  "rentalCards.errors.tooManyPhotos": "يمكنك إرفاق حتى 20 صورة.",
  "rentalCards.errors.photoTooLarge": "يجب ألا تتجاوز كل صورة 5 ميجابايت.",
  "rentalCards.errors.photoType": "يُسمح فقط بصور JPEG أو PNG أو WEBP.",
  "rentalCards.errors.endNotActive": "بطاقة الإيجار هذه غير نشطة.",
  "rentalCards.errors.notRenewable": "بطاقة الإيجار هذه غير قابلة للتجديد.",
  "rentalCards.errors.deleteActive":
    "لا يمكن حذف بطاقات الإيجار النشطة. أنهِها أولًا.",
  "rentalCards.errors.propertyUnavailable":
    "هذا العقار غير متاح للإيجار.",
  "rentalCards.errors.endBeforeToday": "لا يمكن أن يكون تاريخ الانتهاء في المستقبل.",
  "rentalCards.toast.created": "تم إنشاء بطاقة الإيجار بنجاح.",
  "rentalCards.toast.updated": "تم تحديث بطاقة الإيجار بنجاح.",
  "rentalCards.toast.ended": "تم إنهاء بطاقة الإيجار.",
  "rentalCards.toast.renewed": "تم تجديد بطاقة الإيجار.",
  "rentalCards.toast.deleted": "تم حذف بطاقة الإيجار بنجاح.",
  "rentalCards.toast.createFailed": "تعذر إنشاء بطاقة الإيجار.",
  "rentalCards.toast.updateFailed": "تعذر تحديث بطاقة الإيجار.",
  "rentalCards.toast.endFailed": "تعذر إنهاء بطاقة الإيجار.",
  "rentalCards.toast.renewFailed": "تعذر تجديد بطاقة الإيجار.",
  "rentalCards.toast.deleteFailed": "تعذر حذف بطاقة الإيجار.",
  "rentalCards.permission.denied":
    "حسابك يفتقد إلى إذن {permission}، لذا تعيد واجهة API خطأ 403.",
}

const dictionaries: Record<Locale, LocaleLabels> = {
  en: enLabels,
  ar: arLabels,
}

export function getRentalCardLabel(
  locale: Locale | string | undefined,
  key: string,
  vars: Record<string, string | number> = {}
): string {
  const safeLocale: Locale =
    locale === "ar" || locale === "en" ? locale : "en"
  const template = dictionaries[safeLocale]?.[key] ?? dictionaries.en[key] ?? key
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = vars[name]
    return value === undefined ? `{${name}}` : String(value)
  })
}

export function rentalCardStatusLabel(
  locale: Locale | string | undefined,
  status: RentalCardStatus | string | null | undefined
): string {
  if (!status) return ""
  const known = [
    RentalCardStatus.active,
    RentalCardStatus.ended,
    RentalCardStatus.cancelled,
    RentalCardStatus.renewed,
  ]
  if (known.includes(status as RentalCardStatus)) {
    return getRentalCardLabel(locale, `rentalCards.status.${status}`)
  }
  return status
}
