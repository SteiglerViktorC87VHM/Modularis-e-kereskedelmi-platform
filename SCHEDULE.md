# Project Schedule
- 2026-03-01: Database Design & Multi-tenancy
- 2026-03-08: Authentication & RBAC Implementation
- 2026-03-15: Admin Forms & Store Owner Dashboard
- 2026-03-22: Frontend Component & Tailwind Setup
- 2026-03-29: API Development (REST & GraphQL)
- 2026-04-05: State Management & Drag-and-Drop Builder
- 2026-04-12: UI Styling & Dynamic Storefront Rendering
- 2026-04-19: Feature Testing & Sandbox Integration
- 2026-04-26: Performance Optimization & Caching
- 2026-05-03: Security & Compliance Audit
- 2026-05-10: Final Integration & Checkout Validation
- 2026-05-17: Deployment & Documentation

## Database Design & Multi-tenancy
Az adatbázis séma tervezése a PostgreSQL relációs modell alapján történik , különös figyelmet fordítva a több-bérlős (multi-tenant) architektúrára, ahol az adatok elkülönítése store_id alapon valósul meg a biztonságos szeparáció érdekében.

## Authentication & RBAC Implementation
Biztonságos, JWT alapú hitelesítés és szerepkör alapú hozzáférés-kezelés (RBAC) kidolgozása az Admin, Store Owner és Customer felhasználói szintek elkülönítéséhez.

## Admin Forms & Store Owner Dashboard
Az adminisztrációs felületek fejlesztése a bolt-tulajdonosok számára , amely magában foglalja a termékek menedzselését (UC-02) , a rendelések követését és az alapvető statisztikai kimutatásokat.

## Frontend Component & Tailwind Setup
A React és Next.js alapú komponenskönyvtár létrehozása , amely a TailwindCSS segítségével biztosítja a reszponzív megjelenést és a későbbi vizuális boltépítő elemeit.

## API Development (REST & GraphQL)
Hibrid API réteg kialakítása: GraphQL a nagy teljesítményű vásárlói felület kiszolgálásához , és REST API az adminisztrációs műveletekhez, valamint a plugin integrációkhoz.

## State Management & Drag-and-Drop Builder
A vizuális szerkesztő megvalósítása (UC-05) , ahol a felhasználók drag-and-drop módszerrel rendezhetik el a bolt komponenseit , amelyek JSON konfigurációként mentődnek el az adatbázisba.

## UI Styling & Dynamic Storefront Rendering
A vásárlói felület (Storefront) dinamikus generálása a mentett konfigurációk alapján , SSR/SSG technológiával a maximális sebesség és SEO optimalizálás érdekében.

## Feature Testing & Sandbox Integration
A harmadik féltől származó pluginok futtatásához szükséges izolált sandbox (vm2) környezet és a belső Hook/Webhook rendszer tesztelése és integrálása.

## Performance Optimization & Caching
A rendszer válaszidejének optimalizálása Redis gyorsítótár használatával a leggyakoribb lekérdezésekhez (terméklista, rendelések) , biztosítva az 1 másodperc alatti betöltést.

## Security & Compliance Audit
Átfogó biztonsági ellenőrzés (SQL injection elleni védelem, input validáció) és az EU GDPR, valamint a PCI-DSS fizetési szabványoknak való megfelelőség validálása.

## Final Integration & Checkout Validation
A teljes felhasználói útvonal ellenőrzése a termékböngészéstől (UC-04) a sikeres checkout folyamatig (UC-03) és a fizetési tranzakciók hitelesítéséig.

## Deployment & Documentation
A végleges MVP rendszer élesítése felhőalapú környezetbe (Vercel, Railway/Render) és a technikai dokumentáció, valamint a beépített interaktív útmutató (onboarding) lezárása.