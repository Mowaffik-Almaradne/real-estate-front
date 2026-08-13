import type { Locale } from "@/i18n/config"
import { DepositStatus, PaymentMethod } from "./types/enums"

type LocaleLabels = Record<string, string>

const enLabels: LocaleLabels = {
  "deposits.title": "Deposits & Escrow",
  "deposits.subtitle":
    "Track deposits held in escrow between buyers and sellers.",
  "deposits.tab.buyer": "My deposits (buyer)",
  "deposits.tab.seller": "My sales (seller)",
  "deposits.create": "Create deposit",
  "deposits.list.title": "Deposits",
  "deposits.list.loading": "Loading deposits…",
  "deposits.list.empty.title": "No deposits yet",
  "deposits.list.empty.description":
    "When a buyer opens a deposit on one of your properties it will appear here.",
  "deposits.list.empty.seller.description":
    "When a buyer opens a deposit on one of your listings, you'll see it here.",
  "deposits.list.errorTitle": "Could not load deposits",
  "deposits.list.pagination.summary":
    "Showing {from}–{to} of {total}",
  "deposits.list.refresh": "Refresh",
  "deposits.filter.status": "Status",
  "deposits.filter.statusAll": "All statuses",
  "deposits.filter.currency": "Currency",
  "deposits.filter.currencyAll": "All currencies",
  "deposits.filter.search": "Search notes / terms",
  "deposits.filter.reset": "Reset",
  "deposits.filter.apply": "Apply",
  "deposits.fields.property": "Property",
  "deposits.fields.buyer": "Buyer",
  "deposits.fields.seller": "Seller",
  "deposits.fields.amount": "Amount",
  "deposits.fields.currency": "Currency",
  "deposits.fields.status": "Status",
  "deposits.fields.paymentMethod": "Payment method",
  "deposits.fields.terms": "Terms",
  "deposits.fields.notes": "Notes",
  "deposits.fields.createdAt": "Created",
  "deposits.fields.cancelledAt": "Cancelled at",
  "deposits.fields.heldAt": "Held at",
  "deposits.fields.releasedAt": "Released at",
  "deposits.fields.refundedAt": "Refunded at",
  "deposits.fields.disputedAt": "Disputed at",
  "deposits.fields.cancellationReason": "Cancellation reason",
  "deposits.fields.releaseNotes": "Release notes",
  "deposits.fields.refundNotes": "Refund notes",
  "deposits.fields.reason": "Reason",
  "deposits.status.pending": "Pending",
  "deposits.status.held": "Held",
  "deposits.status.released": "Released",
  "deposits.status.refunded": "Refunded",
  "deposits.status.disputed": "Disputed",
  "deposits.status.cancelled": "Cancelled",
  "deposits.paymentMethod.balance": "Wallet balance",
  "deposits.paymentMethod.stripe": "Stripe",
  "deposits.paymentMethod.unknown": "—",
  "deposits.actions.pay": "Pay & hold",
  "deposits.actions.release": "Release to seller",
  "deposits.actions.refund": "Refund buyer",
  "deposits.actions.cancel": "Cancel",
  "deposits.actions.update": "Update",
  "deposits.actions.delete": "Delete",
  "deposits.actions.view": "View details",
  "deposits.actions.confirmDelete": "Delete this deposit?",
  "deposits.actions.confirmDeleteDescription":
    "Only pending, refunded, or cancelled deposits can be deleted. This action cannot be undone.",
  "deposits.createDialog.title": "Create deposit",
  "deposits.createDialog.description":
    "Open a deposit on a property. The seller will be notified to confirm.",
  "deposits.updateDialog.title": "Update deposit",
  "deposits.payDialog.title": "Pay & hold in escrow",
  "deposits.payDialog.description":
    "Funds are transferred from your wallet to the platform escrow account.",
  "deposits.releaseDialog.title": "Release to seller",
  "deposits.releaseDialog.description":
    "Funds will be released from escrow to the seller's wallet.",
  "deposits.refundDialog.title": "Refund buyer",
  "deposits.refundDialog.description":
    "Funds will be returned from escrow to the buyer's wallet.",
  "deposits.cancelDialog.title": "Cancel deposit",
  "deposits.cancelDialog.description":
    "Only pending or disputed deposits can be cancelled.",
  "deposits.errors.amountPositive": "Amount must be greater than 0.",
  "deposits.errors.amountRequired": "Amount is required.",
  "deposits.errors.paymentMethodRequired": "Choose a payment method.",
  "deposits.errors.reasonRequired": "Please provide a reason.",
  "deposits.errors.termsTooLong": "Terms are too long.",
  "deposits.errors.notesTooLong": "Notes are too long.",
  "deposits.errors.propertyRequired": "Property is required.",
  "deposits.errors.sellerRequired": "Seller is required.",
  "deposits.errors.deleteNotAllowed":
    "Only pending, refunded, or cancelled deposits can be deleted.",
  "deposits.toast.created": "Deposit created.",
  "deposits.toast.updated": "Deposit updated.",
  "deposits.toast.paid": "Deposit is now held in escrow.",
  "deposits.toast.released": "Deposit released to the seller.",
  "deposits.toast.refunded": "Deposit refunded to the buyer.",
  "deposits.toast.cancelled": "Deposit cancelled.",
  "deposits.toast.deleted": "Deposit deleted.",
  "deposits.toast.createFailed": "Could not create deposit.",
  "deposits.toast.updateFailed": "Could not update deposit.",
  "deposits.toast.payFailed": "Could not pay deposit.",
  "deposits.toast.releaseFailed": "Could not release deposit.",
  "deposits.toast.refundFailed": "Could not refund deposit.",
  "deposits.toast.cancelFailed": "Could not cancel deposit.",
  "deposits.toast.deleteFailed": "Could not delete deposit.",
  "deposits.permission.denied":
    "Your account is missing the {permission} permission, so this API returns 403.",
}

const arLabels: LocaleLabels = {
  "deposits.title": "العربون / الضمان",
  "deposits.subtitle":
    "تتبع العربون المحتجز في حساب الضمان بين المشتري والبائع.",
  "deposits.tab.buyer": "عربوناتي (كمشتري)",
  "deposits.tab.seller": "مبيعاتي (كبائع)",
  "deposits.create": "إنشاء عربون",
  "deposits.list.title": "العربونات",
  "deposits.list.loading": "جارٍ تحميل العربونات…",
  "deposits.list.empty.title": "لا توجد عربونات بعد",
  "deposits.list.empty.description":
    "عندما يفتح المشتري عربونًا على أحد عقاراتك سيظهر هنا.",
  "deposits.list.empty.seller.description":
    "عندما يفتح المشتري عربونًا على أحد عقاراتك سيظهر هنا.",
  "deposits.list.errorTitle": "تعذر تحميل العربونات",
  "deposits.list.pagination.summary": "عرض {from}–{to} من {total}",
  "deposits.list.refresh": "تحديث",
  "deposits.filter.status": "الحالة",
  "deposits.filter.statusAll": "جميع الحالات",
  "deposits.filter.currency": "العملة",
  "deposits.filter.currencyAll": "جميع العملات",
  "deposits.filter.search": "البحث في الملاحظات / الشروط",
  "deposits.filter.reset": "إعادة تعيين",
  "deposits.filter.apply": "تطبيق",
  "deposits.fields.property": "العقار",
  "deposits.fields.buyer": "المشتري",
  "deposits.fields.seller": "البائع",
  "deposits.fields.amount": "المبلغ",
  "deposits.fields.currency": "العملة",
  "deposits.fields.status": "الحالة",
  "deposits.fields.paymentMethod": "طريقة الدفع",
  "deposits.fields.terms": "الشروط",
  "deposits.fields.notes": "ملاحظات",
  "deposits.fields.createdAt": "تاريخ الإنشاء",
  "deposits.fields.cancelledAt": "تاريخ الإلغاء",
  "deposits.fields.heldAt": "تاريخ الاحتجاز",
  "deposits.fields.releasedAt": "تاريخ التحرير",
  "deposits.fields.refundedAt": "تاريخ الاسترداد",
  "deposits.fields.disputedAt": "تاريخ النزاع",
  "deposits.fields.cancellationReason": "سبب الإلغاء",
  "deposits.fields.releaseNotes": "ملاحظات التحرير",
  "deposits.fields.refundNotes": "ملاحظات الاسترداد",
  "deposits.fields.reason": "السبب",
  "deposits.status.pending": "قيد الانتظار",
  "deposits.status.held": "محتجز",
  "deposits.status.released": "محرر",
  "deposits.status.refunded": "مسترد",
  "deposits.status.disputed": "قيد النزاع",
  "deposits.status.cancelled": "ملغى",
  "deposits.paymentMethod.balance": "رصيد المحفظة",
  "deposits.paymentMethod.stripe": "سترايب",
  "deposits.paymentMethod.unknown": "—",
  "deposits.actions.pay": "ادفع واحتجز",
  "deposits.actions.release": "تحرير للبائع",
  "deposits.actions.refund": "استرداد للمشتري",
  "deposits.actions.cancel": "إلغاء",
  "deposits.actions.update": "تحديث",
  "deposits.actions.delete": "حذف",
  "deposits.actions.view": "عرض التفاصيل",
  "deposits.actions.confirmDelete": "حذف هذا العربون؟",
  "deposits.actions.confirmDeleteDescription":
    "يمكن فقط حذف العربونات قيد الانتظار أو المستردة أو الملغاة. لا يمكن التراجع عن هذا الإجراء.",
  "deposits.createDialog.title": "إنشاء عربون",
  "deposits.createDialog.description":
    "افتح عربونًا على عقار. سيتم إخطار البائع للتأكيد.",
  "deposits.updateDialog.title": "تحديث العربون",
  "deposits.payDialog.title": "ادفع واحتجز في حساب الضمان",
  "deposits.payDialog.description":
    "سيتم تحويل المبلغ من محفظتك إلى حساب الضمان الخاص بالمنصة.",
  "deposits.releaseDialog.title": "تحرير للبائع",
  "deposits.releaseDialog.description":
    "سيتم تحرير المبلغ من حساب الضمان إلى محفظة البائع.",
  "deposits.refundDialog.title": "استرداد للمشتري",
  "deposits.refundDialog.description":
    "سيتم إرجاع المبلغ من حساب الضمان إلى محفظة المشتري.",
  "deposits.cancelDialog.title": "إلغاء العربون",
  "deposits.cancelDialog.description":
    "يمكن فقط إلغاء العربونات قيد الانتظار أو قيد النزاع.",
  "deposits.errors.amountPositive": "يجب أن يكون المبلغ أكبر من 0.",
  "deposits.errors.amountRequired": "المبلغ مطلوب.",
  "deposits.errors.paymentMethodRequired": "اختر طريقة الدفع.",
  "deposits.errors.reasonRequired": "يرجى تقديم سبب.",
  "deposits.errors.termsTooLong": "الشروط طويلة جدًا.",
  "deposits.errors.notesTooLong": "الملاحظات طويلة جدًا.",
  "deposits.errors.propertyRequired": "العقار مطلوب.",
  "deposits.errors.sellerRequired": "البائع مطلوب.",
  "deposits.errors.deleteNotAllowed":
    "يمكن فقط حذف العربونات قيد الانتظار أو المستردة أو الملغاة.",
  "deposits.toast.created": "تم إنشاء العربون.",
  "deposits.toast.updated": "تم تحديث العربون.",
  "deposits.toast.paid": "العربون محتجز الآن في حساب الضمان.",
  "deposits.toast.released": "تم تحرير العربون للبائع.",
  "deposits.toast.refunded": "تم استرداد العربون للمشتري.",
  "deposits.toast.cancelled": "تم إلغاء العربون.",
  "deposits.toast.deleted": "تم حذف العربون.",
  "deposits.toast.createFailed": "تعذر إنشاء العربون.",
  "deposits.toast.updateFailed": "تعذر تحديث العربون.",
  "deposits.toast.payFailed": "تعذر دفع العربون.",
  "deposits.toast.releaseFailed": "تعذر تحرير العربون.",
  "deposits.toast.refundFailed": "تعذر استرداد العربون.",
  "deposits.toast.cancelFailed": "تعذر إلغاء العربون.",
  "deposits.toast.deleteFailed": "تعذر حذف العربون.",
  "deposits.permission.denied":
    "حسابك يفتقد إلى إذن {permission}، لذا تعيد واجهة API خطأ 403.",
}

const dictionaries: Record<Locale, LocaleLabels> = {
  en: enLabels,
  ar: arLabels,
}

export function getDepositLabel(
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

export function depositStatusLabel(
  locale: Locale | string | undefined,
  status: DepositStatus | string | null | undefined
): string {
  if (!status) return ""
  const known = [
    DepositStatus.pending,
    DepositStatus.held,
    DepositStatus.released,
    DepositStatus.refunded,
    DepositStatus.disputed,
    DepositStatus.cancelled,
  ]
  if (known.includes(status as DepositStatus)) {
    return getDepositLabel(locale, `deposits.status.${status}`)
  }
  return status
}

export function paymentMethodLabel(
  locale: Locale | string | undefined,
  method: PaymentMethod | string | null | undefined
): string {
  if (!method) return getDepositLabel(locale, "deposits.paymentMethod.unknown")
  const known = [PaymentMethod.balance, PaymentMethod.stripe]
  if (known.includes(method as PaymentMethod)) {
    return getDepositLabel(locale, `deposits.paymentMethod.${method}`)
  }
  return method
}
