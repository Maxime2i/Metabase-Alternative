# Internal Data Visualization Tool (Metabase Alternative)

Outil interne pour interroger une base PostgreSQL en langage naturel et afficher les résultats en tableau ou en graphiques (barres, lignes). Les rapports peuvent être sauvegardés et réutilisés.

**Stack :** monorepo pnpm, backend NestJS + Drizzle, frontend React + Vite + Tailwind, base PostgreSQL.

---

## Prérequis

- Node.js 20+
- pnpm
- Docker et Docker Compose (pour PostgreSQL en local)

---

## Installation et démarrage

```bash
# À la racine du projet
pnpm install
```

**Base de données :**

```bash
docker compose up -d
pnpm db:migrate
pnpm db:seed
```

Copier `apps/api/.env.example` vers `apps/api/.env` et renseigner au minimum `DATABASE_URL` et `OPENAI_API_KEY` (pour les requêtes en langage naturel).

**Lancer l’app :**

```bash
pnpm dev:api    # API sur http://localhost:3000
pnpm dev:web    # Frontend sur http://localhost:5173 (dans un autre terminal)
```

Le frontend appelle l’API via le proxy `/api` → port 3000.

---

## Utilisation

1. Saisir une question en langage naturel (ex. « How many patients per facility? ») et cliquer sur **Run query**.
2. Consulter les résultats en **Table**, **Bar** ou **Line** (Bar/Line si la 2ᵉ colonne est numérique).
3. **Sauvegarder un rapport** : après une requête, cliquer sur **Save report**, donner un nom.
4. **Réutiliser un rapport** : cliquer sur la carte du rapport dans la colonne **Saved reports** pour réexécuter la requête. Renommer (✎) ou supprimer (×) via les boutons sur la carte.

Le tableau de résultats est paginé (lignes par page : 25 / 50 / 100 / 200). Les dates sont affichées en format lisible.

---

## Déploiement

- **Environnement :** Node.js 20+, pnpm, PostgreSQL (local ou managé).
- **Variables d’environnement (API) :**  
  `DATABASE_URL` (obligatoire), `OPENAI_API_KEY` (obligatoire pour le langage naturel).  
  Optionnel : `PORT`, `OPENAI_MODEL`, `QUERY_TIMEOUT_MS`, `QUERY_MAX_ROWS` (voir `apps/api/.env.example`).
- **Base :** créer la base, puis `pnpm db:migrate`. Optionnel : `pnpm db:seed` pour des données de démo.
- **Build :**
  - API : `pnpm build:api` puis lancer `node apps/api/dist/main.js`.
  - Frontend : `pnpm build:web` ; servir le contenu de `apps/web/dist` (Nginx, Vercel, etc.) et configurer l’URL de l’API (proxy ou env).

---

## Choix techniques

- **Monorepo pnpm** — Un dépôt pour l’API et le frontend, scripts partagés.
- **NestJS + Drizzle** — API structurée, schéma et migrations en TypeScript. Pas d’ORM lourd.
- **OpenAI (GPT-4o-mini)** — Question → SQL. Le schéma des tables est fourni dans le prompt pour coller à la base.
- **Sécurité SQL** — Seuls les `SELECT` sont exécutés. Mots-clés interdits (INSERT, UPDATE, DELETE, DROP, etc.). Un seul statement par requête (pas de `;` au milieu).
- **React + Vite + Tailwind + Recharts** — UI légère, graphiques Bar/Line en plus du tableau.
- **Rapports** — En base (table `reports`) : nom, question, type de graphique. Réutilisation = re-exécution via le LLM.
- **Performances** — Timeout par requête (`statement_timeout`), plafond de lignes (`QUERY_MAX_ROWS`). Pagination possible en body (`limit` / `offset` sur POST /query).

**API principale :**

- **POST /query** — Body : `{ "question": "..." }` (langage naturel) ou `{ "sql": "SELECT ..." }`. Réponse : `rows`, `columns`, `sql?`, `rowCount`, `truncated?`.
- **GET/POST/PUT/DELETE /reports** — CRUD des rapports sauvegardés.

---

## Limites

- **SQL généré** — Le LLM peut se tromper ou produire des requêtes lentes. Pas de validation sémantique côté serveur, seulement la whitelist SELECT.
- **Langage naturel** — Nécessite `OPENAI_API_KEY`. Sans clé, seul le mode SQL brut (body `{ "sql": "..." }`) fonctionne.
- **Graphiques Bar / Line** — Uniquement si le résultat a au moins 2 colonnes et que la 2ᵉ est numérique (ex. agrégations). Sinon, vue Table uniquement.
- **Pas d’authentification** — Aucun utilisateur, droits ou auth (JWT, session, etc.).
- **Données de démo** — Le seeder remplit des données clinique US fictives.
