// app/api/execute/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

function sh(cmd: string, cwd?: string, env?: NodeJS.ProcessEnv) {
  // run command, capture output; throw with stderr if it fails
  return execSync(cmd, {
    cwd,
    stdio: 'pipe',
    env: {
      ...process.env,
      GIT_ASKPASS: 'echo',           // disable interactive prompts
      GIT_TERMINAL_PROMPT: '0',      // ditto
      ...env,
    },
  }).toString();
}

// sanitize any accidental token prints
function scrub(s: string) {
  return s.replace(/:[^@]+@github\.com/g, ':***@github.com');
}

export async function POST(req: Request) {
  const started = Date.now();
  let cloneFolder = '';
  try {
    const { username, token, owner, repository } = await req.json();

    // Validate inputs
    for (const [k, v] of Object.entries({ username, token, owner, repository })) {
      if (!v || typeof v !== 'string') {
        return NextResponse.json({ success: false, error: `Missing or invalid ${k}` }, { status: 400 });
      }
    }

    // Build repo URLs (tokened and safe-for-logs)
    const REPO_URL = `https://${encodeURIComponent(username)}:${encodeURIComponent(token)}@github.com/${owner}/${repository}.git`;
    const REPO_URL_SAFE = REPO_URL.replace(/:[^@]+@github\.com/g, ':***@github.com');

    // Prepare temp folder
    cloneFolder = path.join(process.cwd(), 'tmp_repo');
    if (fs.existsSync(cloneFolder)) fs.rmSync(cloneFolder, { recursive: true, force: true });

    // Clone shallow (faster) with token URL
    sh(`git clone --depth=1 "${REPO_URL}" "${cloneFolder}"`);

    // Set repo-scoped identity + safe.directory + line endings
    sh(`git config user.name "${username}"`, cloneFolder);
    sh(`git config user.email "${username}@example.com"`, cloneFolder);
    sh(`git config core.autocrlf false`, cloneFolder);
    // mark as safe (useful in containerized envs)
    sh(`git config --global safe.directory "${cloneFolder}"`);

    // Ensure branch exists locally
    sh(`git checkout -B update-readme`, cloneFolder);

    // Try to rebase on remote branch if it exists (non-fatal)
    try {
      sh(`git fetch origin update-readme`, cloneFolder);
      sh(`git rebase origin/update-readme`, cloneFolder);
    } catch {
      // branch might not exist remotely yet — fine
    }

    // Write/append change
    const readmePath = path.join(cloneFolder, 'README.md');
    fs.appendFileSync(readmePath, `\n## This is the System\n`);

    // Stage + commit (allow "nothing to commit")
    sh(`git add README.md`, cloneFolder);
    try {
      sh(`git commit -m "Update README.md: Added by ${username}"`, cloneFolder);
    } catch {
      // probably "nothing to commit" — continue
    }

    // Push using tokened URL (do not rely on origin auth)
    try {
      sh(`git push "${REPO_URL}" HEAD:update-readme`, cloneFolder);
    } catch {
      // if remote history diverged, try force
      sh(`git push "${REPO_URL}" HEAD:update-readme --force`, cloneFolder);
    }

    // Clean up temp folder
    try { fs.rmSync(cloneFolder, { recursive: true, force: true }); } catch {}

    return NextResponse.json({
      success: true,
      message: `README.md updated and pushed to 'update-readme' ✅`,
      repo: REPO_URL_SAFE,
      elapsedMs: Date.now() - started,
    });
  } catch (error: any) {
    // scrub secrets & include a hint
    const msg = scrub(String(error?.message || error || 'Unknown error'));
    // attempt cleanup
    try { if (cloneFolder) fs.rmSync(cloneFolder, { recursive: true, force: true }); } catch {}
    return NextResponse.json(
      {
        success: false,
        error: msg,
        hint:
          'If authentication fails: ensure your PAT is a Classic token with "repo" scope OR a fine-grained token with Contents: Read & Write for this repo. Also verify owner/repository values.',
      },
      { status: 500 },
    );
  }
}
