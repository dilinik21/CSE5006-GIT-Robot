//got assist from chatgpt
import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const { username, token, owner, repository } = await req.json();

    const cloneFolder = path.join(process.cwd(), "tmp_repo");
    if (fs.existsSync(cloneFolder)) {
      fs.rmSync(cloneFolder, { recursive: true, force: true });
    }
    execSync(`git config --global user.name "${username}"`);
    execSync(`git clone https://${username}:${token}@github.com/${owner}/${repository}.git "${cloneFolder}"`);
    execSync(`git switch -C update-readme`, { cwd: cloneFolder });
    
    try {
      execSync(`git pull origin update-readme --rebase`, { cwd: cloneFolder, stdio: "inherit" });
    } catch {
      console.warn("No remote updates or pull failed, continuing...");
    }

    const readmePath = path.join(cloneFolder, "README.md");
    fs.appendFileSync(readmePath, `\n## This is the System\n`);

    execSync(`git add README.md`, { cwd: cloneFolder });
    execSync(`git commit -m "Update README.md: Added by ${username}"`, { cwd: cloneFolder });

    try {
      execSync(`git push origin update-readme`, { cwd: cloneFolder, stdio: "inherit" });
    } catch {
      console.warn("Push failed, trying force push...");
      execSync(`git push origin update-readme --force`, { cwd: cloneFolder, stdio: "inherit" });
    }

    return NextResponse.json({ success: true, message: "README.md updated successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
