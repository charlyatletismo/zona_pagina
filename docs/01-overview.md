# 01 — Overview

## What the project is

**Zona Atletismo** organizes running events (street races, trail runs, duathlons and similar) in
the south of Santa Fe province, Argentina. It is based in Villa Constitución. This web application
(production: `https://zonaatletismo.com.ar`) runs the whole event lifecycle:

1. **Publish events.** Organizers create an event with date, location, description, rules,
   disclaimer, prizes, schedule (cronograma), one or more **circuits** (distances), age ranges,
   fees (regular and promotional), payment methods and t-shirt stock. An event can stay hidden
   as a draft.
2. **Registration.** Athletes sign up with their phone number; they get a one-time code by
   WhatsApp. They complete their profile, then register for a circuit. *Athletes managers*
   (coaches or group leaders) register the athletes they manage in bulk. Organizers can register
   anyone, even after registration has closed.
3. **Payment.** Athletes pay online with **MercadoPago Checkout Pro**, or by bank transfer to the
   event's alias, sending the receipt by WhatsApp. For transfers, the organizer records the
   payment by hand. Organizers can also apply discounts or waive the pending amount.
4. **Automatic assignment on payment.** A paid registration receives a **bib number** from its
   circuit's range, a **timing chip** id (competitive circuits only) and a **reserved t-shirt** in
   the athlete's size, if stock is left.
5. **Event logistics.** Organizers manage t-shirt stock, deliver kits (bib + chip + shirt) by
   searching by DNI or bib, show a kiosk "find your bib" screen, and export CSVs for the timing
   software (**Rufus**).
6. **Finances.** Each event has a ledger of inflows and outflows. MercadoPago payments and their
   fees are recorded automatically; everything else is entered by hand.
7. **Administration.** Users, roles, bans, managers, locations and training teams. Free-text
   locations and teams typed by users wait for organizer review.

The UI is in Spanish (Argentina). API messages are bilingual (es/en).

## Roles

Roles are defined in [src/shared/roles.ts](../src/shared/roles.ts). They are not strictly
hierarchical in the UI, but each API permission check accepts a set of roles.

| Capability | athlete | athletes_manager | organizer | admin |
|---|:-:|:-:|:-:|:-:|
| Browse public events, view event page | ✓ | ✓ | ✓ | ✓ |
| Edit own profile (`/settings`) | ✓ | ✓ | ✓ | ✓ |
| Register self, pay, unregister while pending | ✓ | ✓ | ✓ | ✓ |
| Form a 2-person event team (until 15 days before the event) | ✓ | ✓ | ✓ | ✓ |
| Create and edit **managed** athletes, register and pay for them in bulk | | ✓ | ✓ | ✓ |
| See all users, change roles, ban, change DNI, transfer managed athletes | | | ✓ | ✓ |
| Create, edit and delete events, circuits, schedules, clothing | | | ✓ | ✓ |
| Registration admin (discounts, cancel, transfer, kit delivery, exports) | | | ✓ | ✓ |
| Event finances, chip ranges, locations, training teams | | | ✓ | ✓ |
| Cannot be banned or have their role changed; can switch the displayed role in the nav (dev tool) | | | | ✓ |

- `admin` is labelled "Desarrollador" (developer) in the UI. Admins pass every frontend guard,
  but some buttons only render for the exact `organizer` role. Admins use the role switcher in
  the nav to see the organizer UI.
- A **banned** user can still log in and see public pages, but cannot register for events or edit
  their profile. Banning also cancels the user's pending registrations and detaches the athletes
  they manage.

## Glossary

| Term (ES) | Meaning |
|---|---|
| **DNI** | Argentine national ID number. Used as the **user primary key** (`users.id`). |
| **CUIT/CUIL** | Tax ID, format `XX-XXXXXXXX-X`, checksum-validated (`src/shared/cuit.ts`). Stored as `users.tax_id`. Only organizers can edit it. |
| **Evento deportivo** | Sporting event (`sporting_events`). |
| **Circuito** | A route or distance inside an event, e.g. 10K or 3K. It has its own bib range. A *competitive* circuit gets chips and age/sex categories; a non-competitive one has the single category "General". |
| **Dorsal / bib** | Race number printed on the bib, assigned when the registration is paid. |
| **Chip** | Timing chip id, e.g. `CH00325`, assigned on payment in competitive circuits. Chip ids come from organizer-defined **chip segments** (`chips` table: prefix, zero-padding, start, end). |
| **Kit** | Bib + chip + t-shirt that the athlete collects before the race (`kit_delivered`). |
| **Indumentaria / remera / musculosa** | Event clothing: t-shirt (`tshirt`) or tank top (`tanktop`) in sizes XS–XXXL, or `N/A` for none. The size the athlete asked for is *demanded*; the one assigned from stock is *reserved*. |
| **Categoría** | Result category, computed from the event's age ranges, the athlete's sex and the circuit distance, e.g. `30-39/F/10KM`. |
| **Rangos de edad** | Comma-separated lower bounds, e.g. `18,30,40,50`, which give `<18`, `18-29`, … and `50+`. |
| **Tarifa promocional** | Early-bird fee, valid for registrations made before `promotional_fee_end` and paid before `promotional_fee_payment_due_date`. |
| **Manager (athletes_manager)** | A coach or group leader who manages a set of athletes (`users.manager_id`). |
| **Equipo de entrenamiento** | Training team / running club (`training_teams`). A permanent affiliation of the user. |
| **Equipo del evento** | Event team: two registrations in *different*, team-enabled circuits of the same event, linked by `event_team_leader_id` (relay or pair formats). |
| **Ubicación temporal** | A locality typed by a user that does not exist yet. It waits for an organizer to create it. Same for a temporary training team. |
| **Rufus** | Timing software used on race day. The "Rufus" CSV export feeds it. |
| **Alias** | Argentine bank transfer alias (CBU alias) shown for manual payments. |
