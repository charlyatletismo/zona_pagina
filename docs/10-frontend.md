# 10 — Frontend

SPA in [src/react-app](../src/react-app). For the page catalogue, see
[11-features-and-views.md](11-features-and-views.md).

## Bootstrap

- [main.tsx](../src/react-app/main.tsx) creates the TanStack router from the generated
  `routeTree` and wraps the app in `ThemeProvider` (default `light`, stored under `vite-ui-theme`)
  inside `StrictMode`.
- [routes/__root.tsx](../src/react-app/routes/__root.tsx) is the layout. It renders, in order:
  - a ban banner, when `BANNED`;
  - the header: logo (light/dark variant) and `Navigation`;
  - `<Outlet/>`;
  - the footer: Instagram and WhatsApp links;
  - the router devtools.

  It also sets the root `pendingComponent` (`Pending`), `errorComponent` (`ErrorComp`) and
  `notFoundComponent` (`NotFound`, a 404 with a runner animation).

## Routing

- File-based, in `routes/`. The Vite plugin generates `routeTree.gen.ts`; never edit that file.
- Naming:
  - `$param` is a dynamic segment.
  - `.` nests path segments, so `$eventId.transactions.$transactionId.index.tsx` becomes
    `/sportingEvents/$eventId/transactions/$transactionId`.
  - `index.tsx` is the folder index.
- `autoCodeSplitting` is on: each route is lazy-loaded.

### Guards (`beforeLoad`)

| Guard | File | Behavior |
|---|---|---|
| `authCheck(roles = [], mustNotBeBanned = false)` | `lib/authCheck.ts` | Applies the first matching rule: no `JWT_TOKEN` → `/login?redirect=…`; role not in `roles` (admin always allowed) → `/unauthorized`; `REQUIRE_PROFILE_UPDATE` → `/settings/profile`; banned and `mustNotBeBanned` → `/` |
| `unprotectedCheck()` | `lib/beforeLoadGenericCheck.ts` | Public pages. Only applies the profile-update redirect |
| inline | `routes/login.tsx` | Already logged in → `/` |

Guards are UX only. The API re-checks every permission.

### Navigation

[components/nav.tsx](../src/react-app/components/nav.tsx) `LINKS_BY_ROLE`:

| Role | Links |
|---|---|
| anonymous | Inicio, Servicios, Nosotros |
| athlete | Inicio, Mis Eventos, Servicios, Nosotros |
| athletes_manager | Inicio, Usuarios, Mis Eventos, Eventos con inscripciones |
| organizer | Inicio, Gestión, Eventos Activos |
| admin | Inicio, Gestión |

The nav always has a theme toggle. Logged-in users also get Settings (hidden when banned) and
Logout (with confirmation). Admins get the role-switcher pill.
[routes/manage.tsx](../src/react-app/routes/manage.tsx) is the organizer hub with links to every
tool.

## Session (localStorage)

`setUserInfo()` / `clearUserInfo()` in [lib/utils.ts](../src/react-app/lib/utils.ts):

| Key | Set from | Used for |
|---|---|---|
| `JWT_TOKEN` | login | `Authorization` header; "is logged in" |
| `USER_ROLE` | login (admin can cycle it) | guards, nav, showing/hiding UI |
| `USER_ID` | login | self-registration, ownership checks |
| `USER_NAME` | login | greeting |
| `USER_LANGUAGE` | login (`es` default) | `getMessage` language |
| `REQUIRE_PROFILE_UPDATE` | login, cleared on profile save | forced profile completion |
| `ADMIN_MODE` | login when role = admin | role switcher; `FormErrorsCard` debug output |
| `BANNED`, `BAN_REASON` | login, refreshed by `checkUpdates()` | ban banner, disabled actions |
| `PREVIEW_FEATURES` | login for a hard-coded list of user ids | feature-flag hook (not used by any view currently) |

`checkUpdates()` ([lib/checks.ts](../src/react-app/lib/checks.ts)) runs in the home and event-page
loaders. It refreshes the ban status and logs the user out if the server says `force_login`.

## Talking to the API — `lib/apiCalls.ts`

| Helper | Use |
|---|---|
| `getAuthenticatedThrow<T>(path, schema?)` | In **loaders**. A 401 clears the session and redirects to `/login`; a 403 redirects to `/unauthorized` (by throwing `redirect`). If a schema is given, `body.data` is parsed with `schema.nullable().optional()` |
| `getAuthenticated<T>(path, schema?, navigate?)` | Same, but does not throw. Used in components and optional loaders |
| `postAuthenticated<T>(path, body?, navigate?)` | JSON POST |
| `postAuthenticatedFile<T>(path, formData, navigate?)` | Multipart POST (photo upload) |

All helpers return `{ status, body: { data, message? } }`. Components check `status` themselves
and show `getMessage(body.message)`.

**Loader pattern:**

```ts
export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
  beforeLoad: authCheck([], true),
  loader: async () => {
    const res = await getAuthenticatedThrow<z.infer<typeof ARSettingsSchema>>(
      '/api/settings', ARSettingsSchema);
    return { res };
  },
  staleTime: 1000 * 60 * 5,      // 0 on edit pages to always reload
})
```

- Loaders `await` calls one after another.
- After a mutation, pages reload the document (`window.location.reload()` or
  `navigate({..., reloadDocument: true})`) instead of invalidating caches.
- [lib/queryCache.ts](../src/react-app/lib/queryCache.ts) keeps 5-minute in-memory caches of
  training teams and managers (`getTrainingTeamsData`, `getManagersData`, `getNonOrgManagersData`).

## i18n

- All UI copy is **hard-coded Spanish** (Argentine voseo). Field validation messages come from
  the zod schemas in `src/shared/types.ts`, also in Spanish.
- API messages are `{es, en}` objects rendered with `getMessage(msg, default?, prefix?)`.
- Enum labels (roles, statuses, event types, transaction categories and methods) are in
  [src/shared/lang.ts](../src/shared/lang.ts).
- Dates and currency use `toLocaleString('es-AR' | 'es-ES')`. `formatPeriod(start, end)` formats
  schedule ranges.

## Forms

[lib/genForm.ts](../src/react-app/lib/genForm.ts) builds `useAppForm` with TanStack Form's
`createFormHook`. It registers the field components (Input, Label, Calendar, Textarea, PhoneInput,
CuitInput, ComboBoxIdName, DatePicker, DateTimePicker, Switch, SelectCustom, Select/Command/Popover
primitives) and the form component `Button`.

Conventions:

- `validators: { onBlur: SomeZodSchema }` (some use `onChange` or `onSubmitAsync` for server
  checks).
- An invalid field gets `className="border-destructive"` and a `* {errors[0].message}` line in
  `text-xs text-destructive`.
- Footer: a "Reset" outline button plus a submit button that is disabled while
  `!canSubmit || isPristine || isSubmitting`. A `form.Subscribe` shows `Spinner` + "Guardando...".
- In `ADMIN_MODE`, `FormErrorsCard` dumps every form error, for debugging.
- Wrap forms in `FormBox` (centered card, back link, `error` prop that replaces the content).
- Banners: red `bg-red-500/10 text-red-600` + `AlertCircle`, or green for success. They clear
  with `setTimeout` (1.5 s in forms, 3–5 s on pages).

## Tables

TanStack Table v8 everywhere: `createColumnHelper`, then `useReactTable` with sorting, filtering,
pagination and, optionally, grouping, expanding and row selection.

- Sortable headers with ArrowUp/ArrowDown icons.
- A global search box using `customFilterFn` (fuzzy `rankItem` from match-sorter-utils).
- Single-column grouping: only one grouped column at a time (`grouping.slice(-1)`), with
  aggregated counts or sums.
- `PaginationButtons` (page size 10, selectable 10–50) and an "N resultados" count.
- Row selection through `Checkbox` with an indeterminate header. Bulk-action buttons are enabled
  only when every selected row qualifies.
- Client-side CSV export: built in the browser, `;`-separated, downloaded with `Blob`.

## Theming

- Tailwind CSS v4 with shadcn tokens in [index.css](../src/react-app/index.css). Dark mode is
  class-based (`.dark` on `<html>`).
- Brand: primary orange `#fa4d25` (dark `#ff6b4a`), neutral/zinc oklch grays, radius `0.65rem`.
- Custom animations: `animate-tremor` (hover shake, used with `repeat-2`), `animate-wiggle`,
  `animate-outer-shine`, `animate-badge-color-cycle`.
- Recurring visual motifs: a blurred primary blob behind hero headers, and a curved SVG underline
  on highlighted words.
- Role colors: athlete green, manager blue, organizer orange, admin sky.
- Use semantic classes (`bg-primary/5`, `text-muted-foreground`, `border-accent`) so that dark
  mode keeps working.

## Component catalogue

### shadcn primitives (`components/ui/`)

badge, button (includes `icon-sm` size), calendar, checkbox, command, dialog
(`showCloseButton`), dropdown-menu, input, label, navigation-menu, popover, select, spinner,
switch, table, textarea.

### App components (`components/`)

| Component | Purpose | Used in |
|---|---|---|
| `nav.tsx` (`Navigation`) | Role-based menu, settings, logout, theme, role switcher | root layout |
| `themeProvider.tsx`, `themeModeToggle.tsx` | Theme context and light/dark toggle | main, nav |
| `loginForm.tsx` (`LoginDynamicForm`) | Phone → (DNI) → OTP state machine | `/login` |
| `profileForm.tsx` | Full user profile form, with temporary location/team and manager search | settings/profile, users create/edit |
| `profileCard.tsx` | Read-only profile grid | settings, user detail |
| `userIdForm.tsx` | Change DNI | users changeId |
| `locationForm.tsx` | Create/edit a location (id auto-composed, duplicate check, `onSuccess` for inline use) | locations, event form, team form |
| `trainingTeamForm.tsx`, `trainingTeamsTable.tsx` | Team CRUD (coach lookup via `/api/users/exists`) | trainingTeams |
| `sportingEventForm.tsx` | The large event editor (general, fees, location, texts, clothing, schedule, circuits, danger zone) | events create/edit |
| `sportingEventCard.tsx` | Event card for the home grid | home |
| `sportingEventsMinTable.tsx` | Event list table (status pill, organizer actions) | active, history, myEvents, myManagedUsersEvents |
| `sportingEventTransactionForm.tsx`, `spEvTransactionGeneralForm.tsx`, `spEvTransactionRegPayment.tsx` | Transaction form plus two presets (general ledger entry, registration payment) | transactions, allRegistrations |
| `searchRegistrationForm.tsx` | Search paid registrations by DNI suffix and/or bib | kitDelivery, showRegistrations |
| `manageEventTeamDialog.tsx`, `joinAthletesInEvTeamButton.tsx` | Event team management | registerAthletes, allRegistrations |
| `chipsForm.tsx` | Chip segment editor with a live id preview | sportingEvents/chips |
| `uploadImageForm.tsx` | Image picker, preview and upload | editPhotoAndGallery |
| `phoneInput.tsx` | `+CC 9 NNNNNNNNNN` input → `CC_9_N…` | login, profile, team |
| `cuitInput.tsx` | `XX-XXXXXXXX-X` segmented input | profile |
| `comboBoxIdName.tsx` | Searchable combobox (accent-insensitive), "Solicitar crear el dato" option (`valKey`), search-by-id mode | profile, team, event forms, dialogs |
| `selectCustom.tsx`, `datePicker.tsx`, `datetimePicker.tsx` | Form inputs | forms |
| `confirmButton.tsx`, `deleteButton.tsx` | Confirmation dialogs (neutral / destructive) | many |
| `pingingButton.tsx` (`ButtonPing`) | Attention-grabbing CTA | event page |
| `helpTooltip.tsx` | "?" popover | event form, clothing |
| `formBox.tsx`, `formErrorsCard.tsx`, `goBackButton.tsx` | Form layout helpers | most forms |
| `paginationButtons.tsx` | Table pagination | tables |
| `cardGrid.tsx` | Feature card | about, services |
| `error.tsx`, `notFound.tsx`, `pending.tsx` | Router error/404/loading states | root |
| `icons/*` | Facebook, Instagram, MercadoPago, WhatsApp SVGs | various |

## Adding a page — checklist

1. Create `routes/<path>.tsx` with `createFileRoute`, a guard, a loader that uses a zod schema from
   `@shared/apiRespTypes`, and `staleTime`.
2. Copy the layout from a similar page (a `FormBox` page for forms; `users/index.tsx` for tables).
3. Spanish copy; use `getMessage` for API messages.
4. Link it from `nav.tsx` or `manage.tsx` if needed.
5. Run `npm run build` (type-checks route params) and `npm run lint`.
6. Add the page to [11-features-and-views.md](11-features-and-views.md).
