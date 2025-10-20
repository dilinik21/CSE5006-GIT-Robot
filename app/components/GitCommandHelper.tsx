// app/components/GitCommandHelper.tsx
// got assist from chatgpt
"use client";

import React, { useState, useEffect } from "react";
import styles from "./GitCommandHelper.module.css";

type OrmProvider = "prisma" | "sequelize";

export default function GitCommandHelper() {
  const [formData, setFormData] = useState({
    username: "",
    token: "",
    owner: "",
    repository: "",
  });
  const [orm, setOrm] = useState<OrmProvider>("prisma");
  const [output, setOutput] = useState<{ text: string; success: boolean } | null>(null);
  const [commandPreview, setCommandPreview] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const { username, owner, repository, token } = formData;
    const cloneFolder = `clone_repo`;
    const preview = `git config --global user.name "${username}"
git clone https://${username}:${token}@github.com/${owner}/${repository}.git "${cloneFolder}"
cd "${cloneFolder}"
git checkout -b update-readme
echo "## This is the System" >> README.md
git add README.md
git commit -m "Update README.md: Added by ${username}"
git push origin update-readme`;
    setCommandPreview(preview);
  }, [formData]);

  const handleExecute = async () => {
    setOutput({ text: "Executing...", success: true });
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!data?.success) {
        setOutput({ text: `Execution failed: ${data?.error || "Unknown error"}`, success: false });
        return;
      }

      setOutput({ text: `Commands executed successfully ✅`, success: true });
    } catch (err: any) {
      setOutput({ text: `Failed: ${err.message}`, success: false });
    }
  };

  const handleSave = async () => {
    // Save the current preview to the DB using the selected ORM
    setOutput({ text: "Saving to database...", success: true });
    try {
      const res = await fetch("/api/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          owner: formData.owner,
          repo: formData.repository,
          command: commandPreview,
          orm, // tell server which ORM to use
        }),
      });
      const data = await res.json();

      if (res.ok && data?.success) {
        setOutput({
          text: `Saved to ${data.orm.toUpperCase()} successfully ✅ (id: ${data.data?.id ?? "n/a"})`,
          success: true,
        });
      } else {
        setOutput({
          text: `Save failed: ${data?.error || res.statusText}`,
          success: false,
        });
      }
    } catch (err: any) {
      setOutput({ text: `Save error: ${err.message}`, success: false });
    }
  };

  const canExecute =
    formData.username.trim() && formData.token.trim() && formData.owner.trim() && formData.repository.trim();
  const canSave =
    formData.username.trim() && formData.owner.trim() && formData.repository.trim() && commandPreview.trim();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>CSE5006-GIT-Robot</h1>
      <p className={styles.subtitle}>Enter your GitHub details to generate, save, and execute git commands.</p>

      <div className={styles.content}>
        <form onSubmit={(e) => e.preventDefault()}>
          {/* ORM toggle */}
          <div className={styles.formGroup}>
            <label>ORM</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <label>
                <input
                  type="radio"
                  name="orm"
                  value="prisma"
                  checked={orm === "prisma"}
                  onChange={() => setOrm("prisma")}
                  data-testid="orm-prisma"
                />{" "}
                Prisma
              </label>
              <label>
                <input
                  type="radio"
                  name="orm"
                  value="sequelize"
                  checked={orm === "sequelize"}
                  onChange={() => setOrm("sequelize")}
                  data-testid="orm-sequelize"
                />{" "}
                Sequelize
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>GitHub Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your GitHub username"
              onChange={handleChange}
              data-testid="input-username"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Personal Access Token</label>
            <input
              type="password"
              name="token"
              placeholder="Enter your GitHub token"
              onChange={handleChange}
              data-testid="input-token"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Repository Owner</label>
            <input
              type="text"
              name="owner"
              placeholder="Repository owner username"
              onChange={handleChange}
              data-testid="input-owner"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Repository Name</label>
            <input
              type="text"
              name="repository"
              placeholder="Repository name"
              onChange={handleChange}
              data-testid="input-repository"
            />
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleSave}
              disabled={!canSave}
              data-testid="btn-save"
              title={!canSave ? "Fill username/owner/repository first" : "Save generated command"}
            >
              Save
            </button>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleExecute}
              disabled={!canExecute}
              data-testid="btn-execute"
              title={!canExecute ? "Fill all fields including token" : "Execute and push to GitHub"}
            >
              Execute
            </button>
          </div>
        </form>

        <div>
          <h2 className={styles.commandsTitle}>Generated Git Command Preview</h2>
          <pre className={styles.commandBox} style={{ minWidth: "700px", whiteSpace: "pre-wrap" }}>
            {commandPreview}
            {output && (
              <span
                style={{
                  display: "block",
                  marginTop: "20px",
                  color: output.success ? "green" : "red",
                }}
                data-testid="output-status"
              >
                {output.text}
              </span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
