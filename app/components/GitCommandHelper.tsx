// got assist from ChatGPT
"use client";

import React, { useState, useEffect } from "react";
import styles from "./GitCommandHelper.module.css";

export default function GitCommandHelper() {
  const [formData, setFormData] = useState({
    username: "",
    token: "",
    owner: "",
    repository: "",
  });
  const [orm, setOrm] = useState<"prisma" | "sequelize">("prisma");
  const [output, setOutput] = useState<{ text: string; success: boolean } | null>(
    null
  );
  const [commandPreview, setCommandPreview] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      // 1️⃣ Run tutor-provided execute script
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      // 2️⃣ Save this action to database using selected ORM
      await fetch("/api/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          token: formData.token, // masked server-side
          owner: formData.owner,
          repo: formData.repository,
          command: commandPreview,
          orm, // tell server which ORM to use
        }),
      });

      // 3️⃣ Show success message
      if (data.success) {
        setOutput({
          text: `Commands executed and saved successfully ✅ (${orm.toUpperCase()})`,
          success: true,
        });
      } else {
        setOutput({
          text: `Execution failed: ${data.error}`,
          success: false,
        });
      }
    } catch (err: any) {
      setOutput({ text: `Failed: ${err.message}`, success: false });
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Git Command Helper</h1>
      <p className={styles.subtitle}>
        Enter your GitHub details and execute git commands
      </p>

      <div className={styles.content}>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={styles.formGroup}>
            <label>GitHub Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your GitHub username"
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Personal Access Token</label>
            <input
              type="password"
              name="token"
              placeholder="Enter your GitHub token"
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Repository Owner</label>
            <input
              type="text"
              name="owner"
              placeholder="Repository owner username"
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Repository Name</label>
            <input
              type="text"
              name="repository"
              placeholder="Repository name"
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>ORM</label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <label>
                <input
                  type="radio"
                  name="orm"
                  value="prisma"
                  checked={orm === "prisma"}
                  onChange={() => setOrm("prisma")}
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
                />{" "}
                Sequelize
              </label>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleExecute}
            >
              Execute
            </button>
          </div>
        </form>

        <div>
          <h2 className={styles.commandsTitle}>Generated Git Command Preview</h2>
          <pre
            className={styles.commandBox}
            style={{ minWidth: "700px", whiteSpace: "pre-wrap" }}
          >
            {commandPreview}
            {output && (
              <span
                style={{
                  display: "block",
                  marginTop: "20px",
                  color: output.success ? "green" : "red",
                }}
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
