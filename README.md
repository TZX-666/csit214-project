# GUOWANG project

This is an IT system used for managing residential waste disposal and public
facility damage. The prototype supports resident request submission and status
tracking, with staff assessment and assignment planned for the next stage.


### Team Members Of GUOWANG
Manager: Kruti Bhatt

Developer: Rongjun Li & Jeramiah Dekker

UI Design: Zixuan Tang

Documentation: Jineth Situsara

## UI Design

### Editable Figma Design
https://www.figma.com/design/NqyCWbXv7zx98NOdvAm0Aj/

The Figma file contains eight UI screens covering the resident reporting
workflow and the Council staff assessment and assignment workflow.

PNG previews are currently stored in the repository root.

## User guide

See the [Windows setup and run guide](docs/USER_GUIDE.md) for step-by-step
instructions covering Node.js, PowerShell, pnpm, and starting both parts of the
prototype.

## Development workspace

The prototype is being developed on the `setup/initial-scaffold` branch with:

- Vite Vanilla TypeScript and HTML/CSS for the browser client;
- Express and TypeScript for the API; and
- SQLite for local prototype data.

### Client

From the `client` directory:

```bash
pnpm install
pnpm dev
```

The client runs at `http://127.0.0.1:5173`. Requests beginning with `/api`
are forwarded to the local API server.

### Server

Node.js 24 or newer is required because the server uses the built-in
`node:sqlite` module.

From the `server` directory:

```bash
pnpm install
pnpm dev
```

The API runs at `http://127.0.0.1:3000`. Its initial health endpoint is
`GET /api/health`.

Current endpoints are:

- `GET /api/health`
- `GET /api/staff/requests`
- `GET /api/requests/:reference`
- `POST /api/requests`

The current resident pages are:

- `/` — resident home;
- `/report.html` — issue report form;
- `/done.html` — submission confirmation; and
- `/track.html` — request tracking.

Photo selection is checked in the browser but files are not stored in this
first prototype. SQLite stores the report text and creates the request number.

The local database is created at `data/coastlink.sqlite` and is intentionally
excluded from Git. Future schema and fictional sample data will be reproducible
from source-controlled migration and seed files.
