# 11 — Features & views

Every page of the SPA: who can open it, what it loads, what it shows and what each action calls.
Paths are relative to `src/react-app/routes/`. Access uses the guard names from
[10-frontend.md](10-frontend.md#guards-beforeload): **public** means `unprotectedCheck()`; a role
list means `authCheck([...])`, which admins always pass.

## Features by role

**Visitor (not logged in)**
- See the home page with events grouped by registration status, the history of all events, event
  detail pages, and the About and Services pages.
- Clicking "Inscribirse" sends them to login.

**Athlete**
- Sign up and log in with phone + WhatsApp code. Complete the profile (forced on first login).
- Register for a circuit, then see the registration: status, category, bib, chip, shirt size and
  payment breakdown.
- Pay with MercadoPago, or copy the bank alias and send the receipt by WhatsApp.
- Unregister while pending.
- Form an event team with another registered athlete.
- See "Mis Eventos".

**Athletes manager** (everything an athlete can do, plus)
- Create and edit their athletes ("Usuarios").
- On an open event, bulk-register athletes, pay for many at once with MercadoPago, delete
  unpaid registrations, and pair athletes into event teams.
- See the events where their athletes are registered.

**Organizer** (admin: everything, via role switcher)
- **Events:** create and edit events (circuits, schedule, fees, promo, payment methods, clothing),
  set the cover photo, keep events hidden as drafts, delete events.
- **Registrations admin:** discounts, waiving pending amounts, cancel/reactivate, transfers,
  manual payments, kit status, reserving another size, event teams, and CSV exports (Rufus, paid,
  all).
- **Race logistics:** kit delivery desk, kiosk "find your bib" screen, clothing stock, timing-chip
  segments.
- **Finances:** per-event ledger with balance and CSV.
- **Users:** list/search/group, create, edit, change DNI, change role, ban/unban, transfer or
  detach managed athletes.
- **Master data:** locations and training teams, plus review queues for user-typed temporary
  ones.

---

## Public & account pages

### `/` — Home (`index.tsx`)
- **Access:** public.
- **Loads:** `GET /api/sportingEvents`, then `checkUpdates()`.
- **UI:** greeting ("Hola, <name>" or "Eventos Deportivos") with a role-dependent subtitle.
  Sections, each a grid of `SportingEventCard`s linking to the event, rendered only when not
  empty:
  - *Inscripciones Abiertas* (green)
  - *Próximamente* (blue)
  - *Inscripciones Cerradas* (orange)
  - *Eventos Pasados* (gray)
- An empty state ("Próximamente nuevos eventos") and a "Ver todos los eventos" link to the history.

### `/login` (`login.tsx` → `LoginDynamicForm`)
- **Access:** only when logged out.
- **Flow:**
  1. Phone → `POST /api/auth/sendCode`.
  2. On 404, ask for the DNI → `POST /api/auth/register`.
  3. 6-digit code → `POST /api/auth/login` → `setUserInfo` → full reload to `/`.
- A back button returns to the phone step. The phone format is `CC_9_NUMBER`. If the API returns
  `data.tempCode`, it is auto-filled (a dev hook; the API does not currently return it).

### `/settings` (`settings/index.tsx`)
- **Access:** any role, not banned.
- **Loads:** `GET /api/settings`.
- **UI:** "Mi Perfil" `ProfileCard` with an "Editar" button.

### `/settings/profile` (`settings/profile.tsx`)
- **Access:** any role, not banned. This is the forced destination while the profile is
  incomplete.
- **Loads:** `GET /api/settings`, `/api/locations`, `/api/trainingTeams`.
- **UI:** `ProfileForm` → `POST /api/settings`.
- **Fields:**
  - DNI (read-only), phone, name, surname (auto-capitalized), email, sex, locality, address,
    birth date, shirt size, emergency contact, CUIT/CUIL, training team, manager.
  - Locality and team use comboboxes. If nothing matches, "Solicitar crear el dato" stores a
    *temporary* value for organizer review.
  - The manager is found by searching ≥3 DNI digits (`/api/settings/managers/search/:partial`).
- Saving clears `REQUIRE_PROFILE_UPDATE`.

### `/about`, `/services`
- **Access:** public.
- Static marketing pages: history, values, team, services (timing, logistics, design,
  statistics, inclusion…). The WhatsApp CTA points to the organization's number.

### `/unauthorized`
- **Access:** public. "Acceso Restringido" with back and home buttons.

---

## Sporting events

### Event lists
| Path | Access | Loads | Notes |
|---|---|---|---|
| `/sportingEvents` | — | — | Redirects to `/` |
| `/sportingEvents/active` | organizer | `GET /api/sportingEvents` (open + comingSoon + closed) | Sorted by date ascending |
| `/sportingEvents/history` | public | `GET /api/sportingEvents/all` | Adds a "Pasado" status |
| `/sportingEvents/myEvents` | public guard; needs login for data | `GET /api/sportingEvents/myEvents` | "No te has inscripto…" when empty |
| `/sportingEvents/myManagedUsersEvents` | organizer, athletes_manager | `GET /api/sportingEvents/myManagedUsersEvents` | |

All of these render `SportingEventsMinTable`:

- **Columns:** status pill (Abierto/Próximo/Cerrado/Pasado), title (link), description (hidden),
  date, fee, registration start/end, location.
- Fuzzy search and sorting.
- Organizers also get an info/edit actions column.

### `/sportingEvents/create` and `/sportingEvents/$eventId/edit`
- **Access:** organizer.
- **Loads:** `GET /api/locations`; for edit, also `GET /api/sportingEvents/:id`.
- **UI:** `SportingEventForm` (`FormBox`) → `POST /api/sportingEvents/create` or
  `/update/:id` → full reload to the event page. Sections:
  - **General:** title, date, type, description, registration start/end (date+time), age ranges
    ("18,30,40" sorted on blur).
  - **Tarifas:**
    - *Habilitar MercadoPago* switch; its tooltip explains that changing the receiving account
      needs new credentials and a redeploy.
    - Bank alias; fee; payment due date.
    - Promotional fee. When set, it reveals the promo payment due date and the promo end; the
      promo start is shown read-only and equals the registration start.
  - **Ubicación:** locality combobox (can create a new location inline), address, lat/long
    (pasting "lat, long" fills both) and a Google Maps link.
  - **Texts:** disclaimer, rules, prizes.
  - **Indumentaria:** choose *Remeras* or *Musculosas* to create a row per size with a quantity.
    Once the event is saved with clothing, these inputs are frozen; stock is then added from the
    Clothing page. A delete button clears all clothing.
  - **Cronograma:** milestones (title, start/end, locality, address).
  - **Circuitos:**
    - Each circuit has: competitive, name, distance, bib start/end, *Equipos habilitados*,
      *Cerrar inscripciones* (blocks new self-registrations), and a map URL.
    - Defaults for new circuits: the first is competitive with bibs 1–300; each following one
      continues the bib range in blocks of 200.
  - **Other:** external registration URL, results URL, *hidden* (draft).
  - **Edit only, danger zone:** "Eliminar evento" → `POST /api/sportingEvents/delete/:id`.

### `/sportingEvents/$eventId` — Event page (`$eventId.index.tsx`)
- **Access:** public.
- **Loads:** `GET /api/sportingEvents/:id`, then `checkUpdates()`.
- **Organizer toolbar:** Editar, Editar Fotos, Inscripciones (allRegistrations), Inscribir
  Atletas, Entrega de Kits, Balance (transactions), Indumentaria (clothing), Mostrar inscrip.
  (kiosk). Admins see only Editar unless they switch to the organizer role.
- **Body:**
  - A registered user sees a status banner and a pinging "Detalles de inscripción" button.
  - Managers see "Inscribir Atletas" while registration is open. "Ver Resultados" appears when a
    `results_url` exists.
  - Header: title, date, fee (the promo fee with the regular fee struck through while the promo
    runs).
  - Main column: photo, description, schedule, prizes, rules, disclaimer.
  - Sidebar: location (Maps link), registration dates, circuits, an external form button, and the
    bank alias (click to copy) while registration is open.
  - Each circuit shows distance, a map link and a register button (while open).
- **Register button states:** Inscripto / Inscripto en otro circuito / Inscripciones cerradas
  (circuit disabled) / Cuenta bloqueada / Inscribirse.
  - "Inscribirse" calls `POST /api/sportingEvents/:id/register {circuitId, userIds:[me]}` and
    then goes to the registration page. Anonymous users are sent to `/login`.

### `/sportingEvents/$eventId/registration` — My registration
- **Access:** any role.
- **Loads:** `GET …/:id/registration`, `GET …/:id/paymentMethodsInfo`, `GET …/exists/:id`, and
  the training teams (cache).
- **Main panel:** category, training team, clothing (requested size; reserved size, or the reason
  why it isn't reserved yet with remaining units), chip, bib.
- **Event team block** (if the circuit has teams enabled):
  - Lists the members.
  - "Editar" → enter a partner's DNI → `POST …/registrations/makeTeam {reqId: me, destId}`.
  - The trash button dissolves the team (`destId: null`).
  - "Editar" is disabled when the event is less than 15 days away.
- **Sidebar:**
  - Status and payment breakdown: fee, discount with reason, paid, balance.
  - Due-date warnings when less than 7 days remain (regular in red, promo in yellow).
  - A "promotional fee applied" note.
- **Acción requerida** (when owing):
  - "Pagar con Mercado Pago" → `POST …/:id/pay` → redirect to `init_point`.
  - Bank alias (copy) and a WhatsApp "Enviar" button to send the receipt.
- **Eliminar** (pending only): `POST …/:id/unregister {userIds:[me]}`.

### `/sportingEvents/$eventId/registerAthletes` — Bulk registration (managers/organizers)
- **Access:** organizer, athletes_manager.
- **Loads:** training teams, `GET /api/users` (visible users), `GET …/:id/allRegistrations`,
  `GET …/:id`. Unregistered users are merged in as `not_registered` rows.
- **Table:** select, name (link), team, status badge, pending ARS, discount (popover), category
  (popover with circuit details), row menu.
  - Default sort: status → team → name.
- **Row menu:** Pagar (MP enabled and owing), Ver Detalle, Inscribir, Borrar (pending and nothing
  paid), Gestionar equipo / Asignar compañero (team-enabled circuits).
- **Bulk actions** (enabled only if every selected row qualifies):
  - **Inscribir:** pick a circuit → `POST …/:id/register {userIds, circuitId}`.
  - **Pagar:** shows the list and total → `POST …/:id/payMultipleRegs {registrationIds}` →
    MercadoPago.
  - **Borrar:** `POST …/:id/unregister {userIds}`.
  - **Unir:** exactly 2 rows in different team-enabled circuits → `makeTeam`.
- The bank alias is shown at the top when set.

### `/sportingEvents/$eventId/allRegistrations` — Registrations admin
- **Access:** organizer.
- **Loads:** `GET …/:id/allRegistrations` (always fresh).
- **Table:** select, name, team, status, pending, discount, category, bib, chip, size, kit.
  - Size: the reserved size, or the requested one; green when reserved, yellow when only requested
    and paid.
  - Kit: package icon.
  - Single-column grouping. When grouping by team, groups with 10 or more rows show a `%` icon as
    a hint for the team discount.
- **Row → Acciones:**

  | Action | When | Calls |
  |---|---|---|
  | Ver Detalle | any | none (opens `SeeRegistrationDetailsDialog` with the row data) |
  | Registrar pago | pending | `SpEvTransactionRegPaymentForm` → `POST /api/sportingEventTransactions/create` |
  | Aplicar descuento | pending | `…/registrations/applyDiscount` |
  | Desestimar pendiente | pending/expired | `…/registrations/dismissPending` |
  | Cancelar | pending/paid | `…/registrations/cancel` |
  | Reactivar | cancelled | `…/registrations/reactivate` |
  | Transferir | paid | `…/registrations/transfer` (beneficiary DNI) |
  | Kit entregado toggle | any | `…/registrations/:regId/deliveredKit/:flag` |
  | Reservar otro talle | paid | `…/registrations/assignAnotherClothingSize` |
  | Gestionar equipo | team-enabled | `makeTeam` |

- **Bulk:** apply discount (prefilled team-discount reason for 10+ rows), dismiss pending, cancel,
  reactivate, join a team (Unir).
- **Exports** (client-side CSV, `;`-separated, full data set):
  - **Rufus** → `inscripciones_evento_<id>_rufus.csv`, paid only. Columns `bib; chip; name;
    lastname; sex; dob (dd/mm/yyyy); yob; category; country; city; team; course; age;
    event_team_leader_id; dni`.
  - **Pago** → `…_pagas.csv`: paid registrations, every field of the flat registration row.
  - **Todo** → `…_todas.csv`: all statuses, same columns.

### `/sportingEvents/$eventId/kitDelivery` — Kit delivery desk
- **Access:** organizer.
- **UI:** search by DNI (≥3 trailing digits) and/or bib
  (`GET …/:id/paidRegistrations?partialUserId=&bib=`).
- **Results:** DNI, name, bib, chip, size, and a button to mark the kit delivered or undo it
  (`…/deliveredKit/true|false`).
- The search clears after each action, ready for the next athlete.

### `/sportingEvents/$eventId/showRegistrations` — Kiosk screen
- **Access:** organizer. Full-screen overlay for a public monitor at kit pickup.
- **Left:** event photo, logo, title and date.
- **Right:** "INGRESÁ TU NÚMERO DE DORSAL". A bib search (same endpoint) shows the runner's name,
  a large bib, circuit, category and whether a chip is assigned.
- **Footer:** social handles and the event hashtag.

### `/sportingEvents/$eventId/clothing` — Clothing stock
- **Access:** organizer.
- **Loads:** `GET …/:id/clothing`.
- If the event has no clothing yet: a notice linking to edit the event.
- **Table per size:**
  - Comprado (purchased), Demandado (all registrations), Pot. faltante (demand − purchased),
    Reservado, Faltante (paid without a reservation).
  - Amber/red heat colors and help tooltips.
- **"Agregar Indumentaria"** dialog: enter only the **newly bought** units per size →
  `POST …/:id/addClothing`. The new units are reserved right away for paid registrations missing
  their size.

### `/sportingEvents/$eventId/editPhotoAndGallery`
- **Access:** organizer.
- **Loads:** `GET …/:id/gallery`.
- Current photo with delete (`POST …/:id/deletePhoto`) and an uploader (`POST …/:id/updatePhoto`,
  multipart field `file`). The gallery section is not implemented.

### `/sportingEvents/$eventId/transactions` — Event balance
- **Access:** organizer.
- **Loads:** `GET /api/sportingEventTransactions/all/:eventId`.
- **Summary:** Ingresos, Egresos, Balance.
- **Table:** id, date, type badge, category, org/athlete, signed amount. Single-column grouping
  with sums, and a total row.
- **Row actions:**
  - Info: `GET /api/sportingEventTransactions/:id` in a dialog.
  - Edit: link.
  - Delete: `POST …/delete/:id`.
- **Buttons:**
  - "Nueva transacción".
  - **CSV** → `transacciones_evento_<id>.csv`, with `id, transaction_date, transaction_type,
    category, payment_method, amount, registration_id, user_id, vendor_supplier, vendor_or_athlete`.

### `/sportingEvents/$eventId/transactions/create` and `/sportingEvents/$eventId/transactions/$transactionId`
- **Access:** organizer.
- **Create:** `SpEvTransactionGeneralForm`, a general ledger entry. Payment categories are
  excluded; those come from registrations or MercadoPago.
- **Edit:** loads `GET /api/sportingEventTransactions/:id` and opens the full form (event and
  registration ids locked).
- **Form behavior:**
  - The type (inflow/outflow) follows the category automatically.
  - Methods: cash, bank transfer, MercadoPago.
  - Before saving, the form checks that the event exists (`GET /api/sportingEvents/exists/:id`).

### `/sportingEvents/chips` — Timing-chip segments
- **Access:** organizer.
- **Loads:** `GET /api/chips`.
- One `ChipsForm` per segment:
  - Fields: prefix (uppercased, letters only), zero padding, start, end.
  - Live preview of the first, middle and last id.
  - Save: `POST /api/chips` or `/api/chips/:id`.
- Delete: `POST /api/chips/:id/delete`.
- Only one unsaved segment at a time. Overlapping segments are rejected by the API.

---

## Organizer hub

### `/manage` (`manage.tsx`)
- **Access:** organizer.
- Card grid of links:
  - **Eventos:** create, active, history, chips.
  - **Usuarios:** list, create.
  - **Ubicaciones:** list, create, temporary.
  - **Equipos:** list, create, temporary.

---

## Users

### `/users` (`users/index.tsx`)
- **Access:** organizer, athletes_manager.
- **Loads:** `GET /api/users`, managers (cache), training teams (cache).
- **Table:** DNI (hidden), surname, name, team, phone (WhatsApp link), email, CUIT, manager,
  role pill, link to detail.
- Search, single-column grouping (team/manager/role) and pagination.
- Managers see only their athletes, without the role, manager and CUIT columns.
- "Crear Usuario" button.

### `/users/create`, `/users/$userId/edit`
- **Access:** organizer, athletes_manager.
- `ProfileForm`, posting to `POST /api/users/create` or `POST /api/users/:id/update`.
- When a manager creates a user, they become its manager.
- Special needs, discount and CUIT are editable only by organizers.

### `/users/$userId` (`$userId.index.tsx`)
- **Access:** organizer, athletes_manager.
- **Loads:** `GET /api/users/:id`; for manager targets, `/managedUsers`; for organizers,
  `/api/users/managers`.
- **UI:** `ProfileCard`. Organizers viewing a non-admin user other than themselves get:
  - **Editar**.
  - **Cambiar DNI** → `/users/$userId/changeId`.
  - **Cambiar Rol:** dialog Atleta/Manager/Organizador → `POST /:id/setRole`. Blocked while the
    user still manages athletes.
  - **Editar Atl. a Cargo** (manager targets only):
    - Select athletes, then *Transferir* to another manager
      (`POST /api/users/managementTransfer`) or *Remover management*
      (`POST /api/users/managementRemoval`).
  - **Bloquear / Desbloquear:** optional reason → `POST /:id/ban` or `POST /:id/unban`. A warning
    appears when banning a manager.

### `/users/$userId/changeId`
- **Access:** organizer, athletes_manager guard; the API requires Org.
- New DNI → `POST /api/users/changeId {oldId, newId}` → navigates to the new id.

---

## Locations (organizer)

| Path | Loads | UI / actions |
|---|---|---|
| `/locations` | `GET /api/locations/all` | Table locality/province/country/lat/long, edit links, buttons to create and to the temporary queue |
| `/locations/create` | `GET /api/locations` | `LocationForm` → `POST /api/locations/create` (id = "Locality, Province, Country", must be unique) |
| `/locations/$locationId` | `GET /api/locations/:id`, `/api/locations` | `LocationForm` → `POST /api/locations/update/:id` |
| `/locations/checkTemporary` | `GET /api/locations/temporary`, `/api/locations` | Queue of users' free-text localities. Wrench → inline `LocationForm` prefilled → create → `POST /api/locations/updateUser {userId, location}` → refresh. Shows a party icon when the queue is empty |

## Training teams (organizer)

| Path | Loads | UI / actions |
|---|---|---|
| `/trainingTeams` | `GET /api/trainingTeams/all` | `TrainingTeamsTable` (name, coach link, location, last update; info/edit/delete → `POST /api/trainingTeams/delete/:id`) |
| `/trainingTeams/create` | locations, team names | `TrainingTeamForm` → `POST /api/trainingTeams/create`. Unique name; the coach DNI is checked with `GET /api/users/exists/:id` and auto-fills the coach name; a location can be created inline |
| `/trainingTeams/$trainingTeamId` | `GET /api/trainingTeams/:id` | Detail card (location, coach, email, phone, dates) |
| `/trainingTeams/$trainingTeamId/edit` | team, locations | `TrainingTeamForm` → `POST /api/trainingTeams/update/:id` |
| `/trainingTeams/checkTemporary` | `GET /api/trainingTeams/temporary`, `/all`, locations | Queue of users' free-text team names, with existing teams side by side. Wrench → prefilled form → create → `POST /api/trainingTeams/updateUser` → reload |
