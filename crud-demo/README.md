# CRUD React Demo + Docker (Scaffold)

This folder was auto-committed by the app's **Execute** flow.

- `Dockerfile` runs a static preview of `index.html`
- `docker-compose.yml` includes an `ORM_PROVIDER` env to indicate Prisma/Sequelize choice
- `index.html` is a React (CDN) page showing a sample `commands.json`
- `commands.json` contains the latest generated command snapshot

## Run
```
docker compose up --build -d
# open http://localhost:8080
```

> Full working CRUD APIs + DB + ORM toggle live in the main app repo (this scaffold is a marker-friendly artifact).
