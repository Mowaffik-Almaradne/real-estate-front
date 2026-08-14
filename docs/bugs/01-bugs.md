# Frontend 

# Bug 1

Console Error
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error
+ Client- Server

  ...
    <InnerLayoutRouter url="/en/login?..." tree={[...]} params={{locale:"en"}} cacheNode={{rsc:{...}, ...}} ...>
      <SegmentViewNode type="page" pagePath="[locale]/(...">
        <SegmentTrieNode>
        <ClientPageRoot Component={function LoginPage} serverProvidedParams={{...}}>
          <LoginPage params={Promise} searchParams={Promise}>
            <Suspense fallback={null}>
              <LoginFlow>
                <div className="min-h-scre...">
                  <div>
                  <div className="w-full max...">
                    <div className="text-cente...">
                      <div className="inline-fle...">
                        <Building2 className="size-9" strokeWidth={2.25}>
                          <svg
                            ref={null}
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.25}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-building2 lucide-building-2 size-9"
                            aria-hidden="true"
-                           style={{--darkreader-inline-stroke:"currentColor"}}
-                           data-darkreader-inline-stroke=""
                          >
                      ...
                    <div className="glass-card...">
                      <form onSubmit={function handleSendOtp} className="space-y-5">
                        <div className="space-y-2">
                          <label>
                          <div className="relative">
                            <Mail className="absolute l...">
                              <svg
                                ref={null}
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-mail absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mut..."
                                aria-hidden="true"
-                               style={{--darkreader-inline-stroke:"currentColor"}}
-                               data-darkreader-inline-stroke=""
                              >
                            ...
                        ...
                      ...
      ...

app/[locale]/(auth)/login/page.tsx (76:13) @ LoginFlow

  74 |         <div className="text-center mb-8">
  75 |           <div className="inline-flex items-center justify-center size-16 rounded-2xl gradient-primary shadow-lg shadow-primary/25 text-primary-foreground mb-4">
> 76 |             <Building2 className="size-9" strokeWidth={2.25} />
     |             ^
  77 |           </div>
  78 |           <h1 className="text-2xl font-bold tracking-tight">
  79 |             {step === "identifier" ? t("signInTitle") : t("verifyOtp")}

Call Stack 23
Show 20 ignore-listed frame(s)
svg
unknown (0:0)
LoginFlow
app/[locale]/(auth)/login/page.tsx (76:13)
LoginPage
app/[locale]/(auth)/login/page.tsx (15:7)

-----------------------------------------------------
# Bug 2:
صفحة ال login ما فيها password
-----------------------------------------------------
# Bug 3: 
الموقع ما عم يفتح بدون تسجيل دخول
-----------------------------------------------------
# Bug 4: 
الداشبورد يلي فيها static data لازم تنحذف لان مالها فائدة
-----------------------------------------------------
# Bug 5: 
ال Sidebar لازم يكون فيه كل الاقسام يلي موجودة بالمشروع حاليا فيه بس كم شغلة بسيطه
ولازم يظهر الاقسام يلي بال sidebar حسب صلاحية اليوزر
-----------------------------------------------------
# Bug 6: 
Console Error
In HTML, <button> cannot be a descendant of <button>.
This will cause a hydration error.

See more info here: https://nextjs.org/docs/messages/react-hydration-error
+ Client- Server

...
    <CarouselSection title="Browse pro...">
      <section aria-labelledby="carousel-t...">
        <CarouselTitle>
        <RefreshIndicator>
        <div className="group rela...">
          <CarouselNavigation>
          <div ref={function ref} onWheel={function handleWheel} ...>
            <motion.div initial={{opacity:0,y:20}} animate={undefined} transition={{duration:0.5, ...}} ...>
              <div className="flex-shrin..." style={{opacity:0, ...}} ref={function useMotionRef.useCallback}>
                <PropertyCard property={{id:48, ...}} priority={true} index={0}>
                  <motion.article ref={function useIntersectionObserver.useCallback[setRef]} ...>
                    <article className="group rela..." onMouseEnter={function onMouseEnter} ...>
                      <div className="relative a...">
                        <div>
                        <img>
                        <div>
                        <div>
                        <motion.button onClick={function onClick} className="absolute r...">
>                         <button
>                           onClick={function onClick}
>                           className="absolute right-3 top-3"
>                           style={{}}
>                           ref={function useMotionRef.useCallback}
>                         >
                            <FavoriteButton propertyId={48} initial={false} initialCount={undefined} ...>
>                             <button
>                               type="button"
>                               onClick={function onClick}
>                               disabled={false}
>                               aria-label="Add to favorites"
>                               aria-pressed={false}
>                               className="inline-flex size-9 items-center justify-center rounded-full backdrop-blur-m..."
>                             >
                        ...
                      ...
            ...
        ...

src/modules/properties/components/FavoriteButton.tsx (93:5) @ FavoriteButton

  91 |
  92 |   return (
> 93 |     <button
     |     ^
  94 |       type="button"
  95 |       onClick={(e) => void toggle(e)}
  96 |       disabled={busy}

Call Stack 22
Show 15 ignore-listed frame(s)
button
unknown (0:0)
FavoriteButton
src/modules/properties/components/FavoriteButton.tsx (93:5)
PropertyCard
components/properties/PropertyCard.tsx (259:11)
PropertyCarousel/<.children<.children<.children<
components/properties/PropertyCarousel.tsx (342:15)
PropertyCarousel
components/properties/PropertyCarousel.tsx (327:36)
PublicPropertiesPageInner
app/[locale]/properties/page.tsx (342:11)
PublicPropertiesPage
app/[locale]/properties/page.tsx (455:7)
-----------------------------------------------------
# Bug 7 
Console Error
<button> cannot contain a nested <button>.
See this log for the ancestor stack trace.

components/properties/PropertyCard.tsx (252:9) @ PropertyCard

  250 |         </div>
  251 |
> 252 |         <motion.button
      |         ^
  253 |           onClick={(e) => {
  254 |             e.stopPropagation()
  255 |             // Preserve existing animation behaviour for non-favorited taps

Call Stack 25
Show 19 ignore-listed frame(s)
button
unknown (0:0)
PropertyCard
components/properties/PropertyCard.tsx (252:9)
PropertyCarousel/<.children<.children<.children<
components/properties/PropertyCarousel.tsx (342:15)
PropertyCarousel
components/properties/PropertyCarousel.tsx (327:36)
PublicPropertiesPageInner
app/[locale]/properties/page.tsx (342:11)
PublicPropertiesPage
app/[locale]/properties/page.tsx (455:7)
-----------------------------------------------------
# Bug 8:
توحيد اللوان التطبيق حسب اللون ازرق موحد بدل من اللون المتموج بحيث كله يصبح نفس اللون وهذا على  كل النظام بحيث يصبح هذا ال theme
-----------------------------------------------------
# Bugs 9:
تحسين شكل ال public properties لازم الفلاتر تكون فوق وبتنخفى وبتظهر من زر الفلاتر
-----------------------------------------------------
#Bug 10 :
http://localhost:3000/en/compare
يتم عرض ال keys ضمن الجدول بشكل
compare.compare.fields.price
compare.compare.fields.area
...
-----------------------------------------------------
# Bug 11:
Console Error
Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client. Consider using template tag instead (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).

components/providers/ThemeProvider.tsx (9:10) @ ThemeProvider

   7 |
   8 | export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
>  9 |   return <NextThemesProvider {...props}>{children}</NextThemesProvider>
     |          ^
  10 | }
  11 |

Call Stack 18
Show 15 ignore-listed frame(s)
script
unknown (0:0)
ThemeProvider
components/providers/ThemeProvider.tsx (9:10)
LocaleLayout
app/[locale]/layout.tsx (135:11)
-----------------------------------------------------
# Bug 12 : 
MISSING_MESSAGE: Could not resolve `compare.compare.fields.price` in messages for locale `en`.

src/modules/compare/ComparisonTable.tsx (108:20) @ ComparisonTable/<.children<.children<.children<

  106 |                   }`}
  107 |                 >
> 108 |                   {t(field.labelKey)}
      |                    ^
  109 |                 </th>
  110 |                 {values.map((value, idx) => {
  111 |                   const cell = cellValue(value, extremes)

Call Stack 19
Show 16 ignore-listed frame(s)
ComparisonTable/<.children<.children<.children<
src/modules/compare/ComparisonTable.tsx (108:20)
ComparisonTable
src/modules/compare/ComparisonTable.tsx (93:30)
ComparePage
app/[locale]/compare/page.tsx (76:15)
-----------------------------------------------------
# Bug 13 : 
ما عم يظهر ال sidebar وال nav ضمن صفحة ال compare
-----------------------------------------------------
# Bug 14: صفحة ال search وقت ضيف search جديد ما عم يحدث البيانات لحاله لازم اعمل refresh لينعرضوا 
http://localhost:3000/en/saved-searches
ولما عملت apply فتح صفحة ال public properties بس بدون ما يفلتر على شي
-----------------------------------------------------
# Bug 15: 
Browse properties يلي ضمن 
http://localhost:3000/en/properties
حجم ال cards تبع العقارات جدا كبيرة وهاد الشي عم يخليها تطلع برات المتصفح وينعمل scroll وكمان ما عم يظهروا وقت تحمل الصفحة عم يظهروا بس ينبحث عن شي

-----------------------------------------------------
# Bug 16: 
Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error
+ Client- Server

  ...
    <SegmentViewNode type="page" pagePath="[locale]/s...">
      <SegmentTrieNode>
      <ClientPageRoot Component={function SavedSearchesPage} serverProvidedParams={{...}}>
        <SavedSearchesPage params={Promise} searchParams={Promise}>
          <Suspense fallback={null}>
            <SavedSearchesPageInner>
              <DashboardLayout title="Saved sear..." actions={<Button>}>
                <div className="flex min-h...">
                  <Sidebar open={false} onClose={function onClose}>
                    <aside className="fixed inse...">
                      <div className="flex h-16 ...">
                        ...
                          <a className="flex items..." ref={function} onClick={function onClick} ...>
                            <div className="flex items...">
                              <Building2 className="size-4">
                                <svg
                                  ref={null}
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={24}
                                  height={24}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-building2 lucide-building-2 size-4"
                                  aria-hidden="true"
-                                 style={{--darkreader-inline-stroke:"currentColor"}}
-                                 data-darkreader-inline-stroke=""
                                >
                            ...
                        <Button variant="ghost" size="icon-xs" className="lg:hidden ..." onClick={function onClose} ...>
                          <button className="inline-fle..." ref={undefined} onClick={function onClose} aria-label="Close">
                            <X className="size-4">
                              <svg
                                ref={null}
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-x size-4"
                                aria-hidden="true"
-                               style={{--darkreader-inline-stroke:"currentColor"}}
-                               data-darkreader-inline-stroke=""
                              >
                      <nav className="flex-1 spa..." aria-label="Menu">
                        <LinkComponent href="/en" className="group flex..." onClick={function onClose}>
                          <a className="group flex..." ref={function} onClick={function onClick} ...>
                            <House className="size-[18px...">
                              <svg
                                ref={null}
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-house size-[18px] transition-transform duration-200 group-hov..."
                                aria-hidden="true"
-                               style={{--darkreader-inline-stroke:"currentColor"}}
-                               data-darkreader-inline-stroke=""
                              >
                            ...
                        <LinkComponent href="/en/proper..." className="group flex..." onClick={function onClose}>
                          <a className="group flex..." ref={function} onClick={function onClick} ...>
                            <Globe className="size-[18px...">
                              <svg
                                ref={null}
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-globe size-[18px] transition-transform duration-200 group-hov..."
                                aria-hidden="true"
-                               style={{--darkreader-inline-stroke:"currentColor"}}
-                               data-darkreader-inline-stroke=""
                              >
                            ...
                        <LinkComponent href="/en/favorites" className="group flex..." onClick={function onClose}>
                          <a className="group flex..." ref={function} onClick={function onClick} ...>
                            <Heart className="size-[18px...">
                              <svg
                                ref={null}
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-heart size-[18px] transition-transform duration-200 group-hov..."
                                aria-hidden="true"
-                               style={{--darkreader-inline-stroke:"currentColor"}}
-                               data-darkreader-inline-stroke=""
                              >
                            ...
                        <LinkComponent href="/en/saved-..." className="group flex..." onClick={function onClose}>
                          <a className="group flex..." ref={function} onClick={function onClick} ...>
                            <Bookmark className="size-[18px...">
                              <svg
                                ref={null}
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-bookmark size-[18px] transition-transform duration-200"
                                aria-hidden="true"
-                               style={{--darkreader-inline-stroke:"currentColor"}}
-                               data-darkreader-inline-stroke=""
                              >
                            ...
                        <LinkComponent href="/en/notifi..." className="group flex..." onClick={function onClose}>
                          <a className="group flex..." ref={function} onClick={function onClick} ...>
                            <Bell className="size-[18px...">
                              <svg
                                ref={null}
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-bell size-[18px] transition-transform duration-200 group-hove..."
                                aria-hidden="true"
-                               style={{--darkreader-inline-stroke:"currentColor"}}
-                               data-darkreader-inline-stroke=""
                              >
                            ...
                        <LinkComponent href="/en/reviews" className="group flex..." onClick={function onClose}>
                          <a className="group flex..." ref={function} onClick={function onClick} ...>
                            <MessageCircle className="size-[18px...">
                              <svg
                                ref={null}
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-message-circle size-[18px] transition-transform duration-200 ..."
                                aria-hidden="true"
-                               style={{--darkreader-inline-stroke:"currentColor"}}
-                               data-darkreader-inline-stroke=""
                              >
                            ...
                        <LinkComponent href="/en/dashbo..." className="group flex..." onClick={function onClose}>
                          <a
                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transi..."
                            ref={function}
                            onClick={function onClick}
                            onMouseEnter={function onMouseEnter}
                            onTouchStart={function onTouchStart}
+                           href="/en/dashboard/properties"
-                           href="/en/dashboard/viewings"
                          >
                            <Building2 className="size-[18px...">
                              <svg
                                ref={null}
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
+                               className="lucide lucide-building2 lucide-building-2 size-[18px] transition-transform ..."
-                               className="lucide lucide-calendar-check size-[18px] transition-transform duration-200 ..."
                                aria-hidden="true"
-                               style={{--darkreader-inline-stroke:"currentColor"}}
-                               data-darkreader-inline-stroke=""
                              >
                                <path
+                                 d="M10 12h4"
-                                 d="M8 2v3"
                                >
                                <path
+                                 d="M10 8h4"
-                                 d="M16 2v3"
                                >
+                               <path d="M14 21v-3a2 2 0 0 0-4 0v3">
-                               <rect x="3" y="3" width="18" height="18" rx="2">
                                ...
                            ...
                        ...
                      ...
                  ...
    ...

components/layout/Sidebar.tsx (134:17) @ Sidebar/<.children<.children<.children<

  132 |                 onClick={onClose}
  133 |               >
> 134 |                 <item.icon
      |                 ^
  135 |                   className={cn(
  136 |                     "size-[18px] transition-transform duration-200",
  137 |                     !isActive && "group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"

Call Stack 21
Show 15 ignore-listed frame(s)
path
unknown (0:0)
Sidebar/<.children<.children<.children<
components/layout/Sidebar.tsx (134:17)
Sidebar
components/layout/Sidebar.tsx (111:96)
DashboardLayout
components/layout/DashboardLayout.tsx (18:7)
SavedSearchesPageInner
app/[locale]/saved-searches/page.tsx (22:5)
SavedSearchesPage
app/[locale]/saved-searches/page.tsx (57:7)
-----------------------------------------------------
MISSING_MESSAGE: Could not resolve `property.filters.rooms` in messages for locale `en`.

src/modules/saved-searches/components/SavedSearchCard.tsx (79:12) @ SavedSearchCard

  77 |       ? tProperty(`contractOption.${savedSearch.filters.type_of_contract}`)
  78 |       : undefined,
> 79 |     rooms: tProperty("rooms"),
     |            ^
  80 |     bathrooms: tProperty("bathrooms"),
  81 |     noFilters: t("noFilters"),
  82 |   })

Call Stack 21
Show 16 ignore-listed frame(s)
SavedSearchCard
src/modules/saved-searches/components/SavedSearchCard.tsx (79:12)
SavedSearchesList/<.children<
src/modules/saved-searches/components/SavedSearchesList.tsx (103:9)
SavedSearchesList
src/modules/saved-searches/components/SavedSearchesList.tsx (102:17)
SavedSearchesPageInner
app/[locale]/saved-searches/page.tsx (42:9)
SavedSearchesPage
app/[locale]/saved-searches/page.tsx (57:7)
-----------------------------------------------------
# Bug 17:
ضمن صفحة ال properties الاساسية مافي pagination لازم لما اعمل سكرول يظهر منتجات (ملاحظة هذه المشكلة غير مؤكدة)
-----------------------------------------------------
# Bug 18: 
http://localhost:3000/en/properties/66
وقت ينعرض اسم وايميل صاحب العقار وجانبه زر Contact وجنبه زر Booking view الزرار والنص مالهم وسعانين ضمن ال card او ال container او ال div يلي موجودين جواها
+ في ملاحظة هل عم يتم عرض كل بيانات العقار ضمن هي الصفحة 

Console ApiClientError
The search field must not be greater than 255 characters.

lib/apiClient.ts (37:5) @ ApiClientError

  35 |
  36 |   constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
> 37 |     super(message)
     |     ^
  38 |     this.name = "ApiClientError"
  39 |     this.status = status
  40 |     this.errors = errors

Call Stack 3
ApiClientError
lib/apiClient.ts (37:5)
toApiClientError
lib/apiClient.ts (138:10)
<unknown>

-----------------------------------------------------
# Bug 19: 
exceptions.not_found

lib/apiClient.ts (37:5) @ ApiClientError

  35 |
  36 |   constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
> 37 |     super(message)
     |     ^
  38 |     this.name = "ApiClientError"
  39 |     this.status = status
  40 |     this.errors = errors

Call Stack 40
Show 33 ignore-listed frame(s)
ApiClientError
lib/apiClient.ts (37:5)
toApiClientError
lib/apiClient.ts (138:10)
<unknown>
lib/apiClient.ts (108:22)
getPropertyById
src/modules/properties/services/propertyService.ts (138:38)
PropertyEditPage.useCallback[fetchProperty]
app/[locale]/dashboard/properties/[id]/edit/page.tsx (140:46)
PropertyEditPage.useEffect.handle
app/[locale]/dashboard/properties/[id]/edit/page.tsx (169:12)
setTimeout handler*PropertyEditPage.useEffect
app/[locale]/dashboard/properties/[id]/edit/page.tsx (167:27)
-----------------------------------------------------
# Bug 19: 
اذا كان العقار Soldلا تظهر زر Contract, Book Viewing لان العقار في هذه الحالة غير متاح
-----------------------------------------------------
# Bug 20 :
http://localhost:3000/en/chat?room=1
تحت الرسالة عم يظهر زرين علامة x واحد منهم replay لازم يظهر icon بتدل علىه

-----------------------------------------------------
# Bug 21 : 
In HTML, <div> cannot be a descendant of <p>.
This will cause a hydration error.

See more info here: https://nextjs.org/docs/messages/react-hydration-error
+ Client- Server

...
    <ClientPageRoot Component={function ChatPage} serverProvidedParams={{...}}>
      <ChatPage params={Promise} searchParams={Promise}>
        <Suspense fallback={<div>}>
          <ChatContent>
            <DashboardLayout title="Messages">
              <div className="flex min-h...">
                <Sidebar>
                <div className="flex-1 fle...">
                  <Header>
                  <main className="flex-1 p-4...">
                    <div className="-m-4 flex ...">
                      <ChatRoomListSidebar>
                      <div className="hidden fle...">
                        <ChatHeader room={{id:1,type:"pri...", ...}} currentUserId={53} isConnected={false} ...>
                          <header className={"flex ite..."}>
                            <div className="flex min-w...">
                              <Button>
                              <div>
                              <div className="min-w-0">
                                <p>
>                               <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <ConnectionStatus isConnected={false}>
>                                   <div role="status" className="flex items-center gap-1.5 text-amber-600">
                        ...
                      ...

src/components/features/chat/connection-status.tsx (24:5) @ ConnectionStatus

  22 |
  23 |   return (
> 24 |     <div role="status" className="flex items-center gap-1.5 text-amber-600">
     |     ^
  25 |       <WifiOff className="size-3.5" aria-hidden />
  26 |       <span className="text-xs font-medium">{t("reconnecting")}</span>
  27 |       <span className="size-2 animate-pulse rounded-full bg-amber-500" aria-hidden />

Call Stack 19
Show 14 ignore-listed frame(s)
div
unknown (0:0)
ConnectionStatus
src/components/features/chat/connection-status.tsx (24:5)
ChatHeader
src/modules/chat/components/ChatHeader.tsx (65:15)
ChatContent
app/[locale]/chat/page.tsx (131:15)
ChatPage
app/[locale]/chat/page.tsx (229:7)

-----------------------------------------------------
# Bug 22 : 
Console Error
<p> cannot contain a nested <div>.
See this log for the ancestor stack trace.

src/modules/chat/components/ChatHeader.tsx (58:11) @ ChatHeader

  56 |         <div className="min-w-0">
  57 |           <p className="truncate text-sm font-semibold">{displayName}</p>
> 58 |           <p className="flex items-center gap-1 text-xs text-muted-foreground">
     |           ^
  59 |             {room.type === "group" ? (
  60 |               <>
  61 |                 <Users className="size-3" aria-hidden />

Call Stack 20
Show 16 ignore-listed frame(s)
p
unknown (0:0)
ChatHeader
src/modules/chat/components/ChatHeader.tsx (58:11)
ChatContent
app/[locale]/chat/page.tsx (131:15)
ChatPage
app/[locale]/chat/page.tsx (229:7)
-----------------------------------------------------
# Bug 23 : 

-----------------------------------------------------
-----------------------------------------------------
-----------------------------------------------------
-----------------------------------------------------
-----------------------------------------------------
-----------------------------------------------------
-----------------------------------------------------

