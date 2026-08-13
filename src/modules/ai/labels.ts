import type { Locale } from "@/i18n/config"

type LocaleLabels = Record<string, string>

const enLabels: LocaleLabels = {
  "ai.title": "AI tools",
  "ai.subtitle":
    "Smart search and description assistant powered by the platform AI.",
  "ai.tab.search": "Smart search",
  "ai.tab.assistant": "Description assistant",
  "ai.search.heading": "Smart search",
  "ai.search.description":
    "Describe what you're looking for in natural language (5–500 characters).",
  "ai.search.field.query": "Query",
  "ai.search.field.queryPlaceholder":
    "e.g. Furnished 2-bedroom apartment for rent in Riyadh under 4000 SAR",
  "ai.search.submit": "Search",
  "ai.search.empty.title": "Run a search",
  "ai.search.empty.description":
    "Type a description and the AI will return matching properties.",
  "ai.search.loading": "Searching…",
  "ai.search.error.title": "Search failed",
  "ai.search.noResults": "No matching properties.",
  "ai.search.results.title": "Results",
  "ai.search.results.summary":
    "Found {total} match(es) for your query.",
  "ai.search.score": "Match",
  "ai.assistant.heading": "Description assistant",
  "ai.assistant.subtitle":
    "Generate, improve, or extract titles and features for your listings.",
  "ai.assistant.tab.generate": "Generate description",
  "ai.assistant.tab.improve": "Improve description",
  "ai.assistant.tab.suggestTitle": "Suggest title",
  "ai.assistant.tab.suggestFeatures": "Suggest features",
  "ai.assistant.language": "Output language",
  "ai.assistant.language.en": "English",
  "ai.assistant.language.ar": "Arabic",
  "ai.assistant.propertyType": "Property type",
  "ai.assistant.propertyTypePlaceholder": "apartment, villa, office…",
  "ai.assistant.currentDescription": "Current description",
  "ai.assistant.currentDescriptionPlaceholder":
    "Paste your existing description here.",
  "ai.assistant.submit.generate": "Generate",
  "ai.assistant.submit.improve": "Improve",
  "ai.assistant.submit.suggestTitle": "Suggest titles",
  "ai.assistant.submit.suggestFeatures": "Suggest features",
  "ai.assistant.response.title": "AI response",
  "ai.assistant.response.empty":
    "Submit a request to see the AI's response here.",
  "ai.assistant.titles.title": "Suggested titles",
  "ai.assistant.features.title": "Suggested feature bullets",
  "ai.assistant.copy": "Copy",
  "ai.assistant.copied": "Copied to clipboard.",
  "ai.assistant.rateLimited":
    "The AI endpoints are rate limited. Please wait a moment and try again.",
  "ai.errors.queryTooShort":
    "Query must be at least 5 characters.",
  "ai.errors.queryTooLong":
    "Query must be at most 500 characters.",
  "ai.errors.propertyTypeRequired":
    "Property type is required.",
  "ai.errors.descriptionRequired":
    "Please paste the description you want to improve.",
  "ai.toast.searchFailed": "Smart search failed.",
  "ai.toast.generateFailed": "Could not generate a description.",
  "ai.toast.improveFailed": "Could not improve the description.",
  "ai.toast.suggestTitleFailed": "Could not suggest titles.",
  "ai.toast.suggestFeaturesFailed": "Could not suggest features.",
  "ai.permission.denied":
    "Your account is missing the {permission} permission, so this API returns 403.",
}

const arLabels: LocaleLabels = {
  "ai.title": "أدوات الذكاء الاصطناعي",
  "ai.subtitle":
    "البحث الذكي ومساعد كتابة الوصف المدعوم بالذكاء الاصطناعي للمنصة.",
  "ai.tab.search": "البحث الذكي",
  "ai.tab.assistant": "مساعد الوصف",
  "ai.search.heading": "البحث الذكي",
  "ai.search.description":
    "صف ما تبحث عنه بلغة طبيعية (5–500 حرف).",
  "ai.search.field.query": "الاستعلام",
  "ai.search.field.queryPlaceholder":
    "مثال: شقة مفروشة غرفتين للإيجار في الرياض أقل من 4000 ريال",
  "ai.search.submit": "بحث",
  "ai.search.empty.title": "ابدأ البحث",
  "ai.search.empty.description":
    "اكتب وصفًا وسيرجع الذكاء الاصطناعي بالعقارات المطابقة.",
  "ai.search.loading": "جارٍ البحث…",
  "ai.search.error.title": "فشل البحث",
  "ai.search.noResults": "لا توجد عقارات مطابقة.",
  "ai.search.results.title": "النتائج",
  "ai.search.results.summary": "تم العثور على {total} نتيجة مطابقة.",
  "ai.search.score": "التطابق",
  "ai.assistant.heading": "مساعد الوصف",
  "ai.assistant.subtitle":
    "أنشئ أو حسّن أو استخرج العناوين والميزات لقوائمك.",
  "ai.assistant.tab.generate": "إنشاء وصف",
  "ai.assistant.tab.improve": "تحسين وصف",
  "ai.assistant.tab.suggestTitle": "اقتراح عنوان",
  "ai.assistant.tab.suggestFeatures": "اقتراح ميزات",
  "ai.assistant.language": "لغة المخرجات",
  "ai.assistant.language.en": "الإنجليزية",
  "ai.assistant.language.ar": "العربية",
  "ai.assistant.propertyType": "نوع العقار",
  "ai.assistant.propertyTypePlaceholder": "شقة، فيلا، مكتب…",
  "ai.assistant.currentDescription": "الوصف الحالي",
  "ai.assistant.currentDescriptionPlaceholder":
    "الصق وصفك الحالي هنا.",
  "ai.assistant.submit.generate": "إنشاء",
  "ai.assistant.submit.improve": "تحسين",
  "ai.assistant.submit.suggestTitle": "اقتراح عناوين",
  "ai.assistant.submit.suggestFeatures": "اقتراح ميزات",
  "ai.assistant.response.title": "استجابة الذكاء الاصطناعي",
  "ai.assistant.response.empty":
    "أرسل طلبًا لرؤية استجابة الذكاء الاصطناعي هنا.",
  "ai.assistant.titles.title": "العناوين المقترحة",
  "ai.assistant.features.title": "ميزات مقترحة",
  "ai.assistant.copy": "نسخ",
  "ai.assistant.copied": "تم النسخ إلى الحافظة.",
  "ai.assistant.rateLimited":
    "واجهات الذكاء الاصطناعي محدودة المعدل. انتظر قليلاً وأعد المحاولة.",
  "ai.errors.queryTooShort": "يجب ألا يقل الاستعلام عن 5 أحرف.",
  "ai.errors.queryTooLong": "يجب ألا يزيد الاستعلام عن 500 حرف.",
  "ai.errors.propertyTypeRequired": "نوع العقار مطلوب.",
  "ai.errors.descriptionRequired": "الرجاء لصق الوصف الذي تريد تحسينه.",
  "ai.toast.searchFailed": "فشل البحث الذكي.",
  "ai.toast.generateFailed": "تعذر إنشاء الوصف.",
  "ai.toast.improveFailed": "تعذر تحسين الوصف.",
  "ai.toast.suggestTitleFailed": "تعذر اقتراح العناوين.",
  "ai.toast.suggestFeaturesFailed": "تعذر اقتراح الميزات.",
  "ai.permission.denied":
    "حسابك يفتقد إلى إذن {permission}، لذا تعيد واجهة API خطأ 403.",
}

const dictionaries: Record<Locale, LocaleLabels> = {
  en: enLabels,
  ar: arLabels,
}

export function getAiLabel(
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
