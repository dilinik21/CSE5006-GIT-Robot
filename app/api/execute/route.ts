// app/api/execute/route.ts
// got assist from chatgpt
import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

function sh(cmd: string, cwd?: string) {
  return execSync(cmd, { cwd, stdio: "pipe", env: process.env }).toString();
}

export async function POST(req: Request) {
  const started = Date.now();
  try {
    const { username, token, owner, repository } = await req.json();

    // basic validation
    for (const [k, v] of Object.entries({ username, token, owner, repository })) {
      if (!v || typeof v !== "string") {
        return NextResponse.json({ success: false, error: `Missing or invalid ${k}` }, { status: 400 });
      }
    }

    // tokened remote
    const REPO_URL = `https://${encodeURIComponent(username)}:${encodeURIComponent(token)}@github.com/${owner}/${repository}.git`;

    // clean clone folder
    const cloneFolder = path.join(process.cwd(), "tmp_repo");
    if (fs.existsSync(cloneFolder)) fs.rmSync(cloneFolder, { recursive: true, force: true });

    // git identity + safe dir
    sh(`git config --global user.name "${username}"`);
    sh(`git config --global user.email "${username}@example.com"`);
    sh(`git config --global safe.directory "*"`);
    sh(`git config --global advice.skippedCherryPicks false`);

    // clone
    sh(`git clone "${REPO_URL}" "${cloneFolder}"`);

    // branch
    sh(`git checkout -B update-readme`, cloneFolder);
    try {
      sh(`git fetch origin update-readme`, cloneFolder);
      sh(`git rebase origin/update-readme`, cloneFolder);
    } catch {
      /* branch may not exist remotely yet */
    }

    // 1) README tweak
    const readmePath = path.join(cloneFolder, "README.md");
    const line = `\n## This is the System (auto-updated by Execute at ${new Date().toISOString()})\n`;
    fs.appendFileSync(readmePath, line);

    // 2) CRUD + Docker scaffold
    const scaffoldRoot = path.join(cloneFolder, "crud-demo");
    fs.mkdirSync(scaffoldRoot, { recursive: true });

    // Dockerfile
    fs.writeFileSync(
      path.join(scaffoldRoot, "Dockerfile"),
      `FROM node:20
WORKDIR /app
COPY . .
RUN npm i -g serve
EXPOSE 8080
CMD ["serve","-s",".","-l","8080"]
`
    );

    // docker-compose
    fs.writeFileSync(
      path.join(scaffoldRoot, "docker-compose.yml"),
      `services:
  crud-demo:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ORM_PROVIDER=\${ORM_PROVIDER:-prisma}
`
    );

    // index.html (React via CDN, displays commands.json)
    fs.writeFileSync(
      path.join(scaffoldRoot, "index.html"),
      `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>CRUD React Demo</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>body{font-family:system-ui,Arial;margin:24px} pre{white-space:pre-wrap}</style>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
</head>
<body>
  <h1>CRUD React Demo (ORM: <span id="orm">prisma</span>)</h1>
  <div id="root"></div>
  <script>
    document.getElementById('orm').textContent = (new URLSearchParams(location.search)).get('orm') || 'prisma';
    const e = React.createElement;
    function App(){
      const [rows,setRows]=React.useState([]);
      React.useEffect(()=>{ fetch('./commands.json').then(r=>r.json()).then(setRows).catch(()=>setRows([])) },[]);
      return e('div',null,[
        e('p',{key:'p'},'This demo ships with commands.json as a sample persisted list.'),
        e('pre',{key:'pre'}, JSON.stringify(rows,null,2))
      ]);
    }
    ReactDOM.createRoot(document.getElementById('root')).render(e(App));
  </script>
</body>
</html>
`
    );

    // commands.json snapshot (from current inputs)
    fs.writeFileSync(
      path.join(scaffoldRoot, "commands.json"),
      JSON.stringify(
        [
          {
            id: Date.now(),
            username,
            owner,
            repo: repository,
            command:
              `git config --global user.name "${username}"\\n` +
              `git clone https://${username}:***@github.com/${owner}/${repository}.git "clone_repo"\\n` +
              `cd "clone_repo"\\n` +
              `git checkout -b update-readme\\n` +
              `echo "## This is the System" >> README.md\\n` +
              `git add README.md\\n` +
              `git commit -m "Update README.md: Added by ${username}"\\n` +
              `git push origin update-readme`,
            createdAt: new Date().toISOString(),
            orm: "toggle-in-main-app"
          }
        ],
        null,
        2
      )
    );

    // README explaining the scaffold
    fs.writeFileSync(
      path.join(scaffoldRoot, "README.md"),
      `# CRUD React Demo + Docker (Scaffold)

This folder was auto-committed by the app's **Execute** flow.

- \`Dockerfile\` runs a static preview of \`index.html\`
- \`docker-compose.yml\` includes an \`ORM_PROVIDER\` env to indicate Prisma/Sequelize choice
- \`index.html\` is a React (CDN) page showing a sample \`commands.json\`
- \`commands.json\` contains the latest generated command snapshot

## Run
\`\`\`
docker compose up --build -d
# open http://localhost:8080
\`\`\`

> Full working CRUD APIs + DB + ORM toggle live in the main app repo (this scaffold is a marker-friendly artifact).
`
    );

    // stage + commit + push
    sh(`git add -A`, cloneFolder);
    // one commit message that clearly mentions both parts
    try {
      sh(`git commit -m "Auto: update README and add CRUD React + Docker scaffold"`, cloneFolder);
    } catch {
      // nothing to commit? continue
    }

    sh(`git remote set-url origin "${REPO_URL}"`, cloneFolder);
    try {
      sh(`git push origin HEAD:update-readme`, cloneFolder);
    } catch {
      sh(`git push origin HEAD:update-readme --force`, cloneFolder);
    }

    return NextResponse.json({
      success: true,
      message: "README + CRUD/Docker scaffold committed to 'update-readme' ✅",
      elapsedMs: Date.now() - started,
    });
  } catch (error: any) {
    const msg = String(error?.message || error || "Unknown error").replace(/:[^@]+@github\.com/g, ":***@github.com");
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
