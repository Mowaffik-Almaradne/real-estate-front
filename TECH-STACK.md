# Tech Stack

## Language
- **TypeScript 5** with strict mode, ES2017 target, bundler module resolution

## Framework & Build
- **Next.js 16.2.3** — App Router with file-based routing, dynamic routes, middleware
- **React 19.2.4**
- **SWC** — native compilation/minification via Next.js
- **PostCSS** — with `@tailwindcss/postcss` plugin

## Styling
- **Tailwind CSS 4** — configured via `@import "tailwindcss"` in `globals.css`
- **OKLCH color space** with CSS custom properties for light/dark theming
- **Utilities:** `clsx`, `tailwind-merge`, `class-variance-authority`, `tw-animate-css`
- **Custom styles:** glassmorphism, gradients, keyframe animations (fade, slide, scale, shimmer)

## UI Components
- **shadcn/ui** (Radix-based) — 15+ reusable components: Button, Card, Dialog, Select, DropdownMenu, Table, Switch, Badge, Input, Textarea, Label, Skeleton, Combobox, Sonner
- **Radix UI** — primitives for dialog, popover, select, dropdown, switch

## Icons
- **Lucide React 1.8** — Bell, Check, Search, X, Loader2, ChevronDown, etc.

## State Management
- **React Context** — AuthContext (auth/user state), RealtimeContext (WebSocket data)
- **SWR 2.4** — server state caching & revalidation for property data
- **React useState / useReducer** — local component state

## Routing
- **Next.js App Router** — file-based routing in `/app`
- **Route groups** — `(auth)/login`, `(auth)/register`
- **Dynamic routes** — `properties/[id]`, `chat/[roomId]`
- **Middleware** — cookie/header token check with redirect to `/login`

## HTTP & API
- **Axios 1.15** — configured instance with Bearer token interceptor and 401 redirect
- **Fetch API** — used in chat and notification services
- **Path alias** `@/*` maps to project root

## Real-Time
- **Laravel Echo 2.3** — WebSocket client for Laravel broadcasting
- **Pusher.js 8.5** — underlying WebSocket transport
- **Laravel Reverb** — backend WebSocket server
- **Event types:** chat messages, typing indicators, notifications, unread counts

## Forms & Validation
- **React Hook Form 7.72** — form state management
- **Zod 4.3** — schema validation for chat, notifications, and DTOs
- **@hookform/resolvers 5.2** — React Hook Form + Zod integration

## Animations
- **Framer Motion 12.38**
- **CSS keyframes** — fade-in/out, slide-in/out, scale-in, shimmer

## Theming
- **next-themes 0.4** — light/dark mode toggling via CSS class strategy

## Notifications (Toast)
- **Sonner 2.0** — toast system with custom icons per variant

## Data Tables
- **@tanstack/react-table 8.21** — headless table with sorting, pagination, etc.

## Linting
- **ESLint 9** (flat config) + **eslint-config-next 16.2** with core-web-vitals + TypeScript rules

## Testing
- None configured

## Firebase Cloud Messaging
- Scaffolded but not fully functional (returns `null` stubs)
