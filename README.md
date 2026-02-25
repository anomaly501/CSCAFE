# ☕ cscafe

A curated platform for CSE students to discover opportunities — internships, jobs, scholarships, hackathons, and more.

## Tech Stack

- **Frontend:** HTML, Tailwind CSS, Vanilla JS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon)
- **Security:** Helmet, API key auth, rate limiting, input validation

## Project Structure

```
cspoint/
├── public/              # Static files served to browsers
│   ├── index.html       # Homepage — opportunity listings
│   ├── post.html        # Individual opportunity detail page
│   ├── admin.html       # Admin dashboard (CRUD operations)
│   └── cup.png          # Logo asset
├── server.js            # Express API server (secured)
├── db.js                # PostgreSQL connection & schema
├── .env                 # Environment variables (not committed)
├── .env.example         # Template for .env
└── package.json
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/cspoint.git
cd cspoint

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Neon DATABASE_URL

# 4. Start the server
npm start
```

The server will print an **API key** to the console on first run:

```
✅  cscafe API running at http://localhost:3000
🔑  API Key: <generated-key>
```

Add this key to your `.env` as `API_KEY=<key>` to keep it persistent across restarts.

### Open in Browser

- **Homepage:** [http://localhost:3000](http://localhost:3000)
- **Admin Panel:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `API_KEY` | Optional | API key for admin operations. Auto-generated if not set |
| `ALLOWED_ORIGINS` | Optional | Comma-separated CORS origins. Defaults to `http://localhost:3000` |
| `PORT` | Optional | Server port. Defaults to `3000` |

## API Endpoints

### Public (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/updates` | List all updates (filterable by `?cat=`) |
| GET | `/api/updates/:id` | Get single update |
| GET | `/api/deadlines` | List all deadlines |
| GET | `/api/resources` | List all resources |
| GET | `/api/links` | List all links |
| GET | `/api/stats` | Dashboard statistics |

### Protected (requires `X-API-Key` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/updates` | Create update |
| PUT | `/api/updates/:id` | Edit update |
| DELETE | `/api/updates/:id` | Delete update |
| POST/PUT/DELETE | `/api/deadlines/:id` | CRUD deadlines |
| POST/PUT/DELETE | `/api/resources/:id` | CRUD resources |
| POST/PUT/DELETE | `/api/links/:id` | CRUD links |

## Security

- **API Key Authentication** on all write endpoints
- **Helmet** HTTP security headers
- **Rate Limiting** — 200 req/15min global, 50 writes/15min
- **CORS** restricted to allowed origins
- **XSS Prevention** — all user data escaped with `escapeHTML()`
- **Input Validation** — server-side length, type, and URL checks
- **Parameterized SQL** — no SQL injection risk
- **Static isolation** — only `public/` is served, backend files are inaccessible

## License

MIT
