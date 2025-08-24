"use client";
import { useState } from "react";
import styles from "./HamburgerMenu.module.css";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        className={styles["hamburger-menu"]}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles["hamburger-line"]}></div>
        <div className={styles["hamburger-line"]}></div>
        <div className={styles["hamburger-line"]}></div>
      </div>

      {isOpen && (
        <div className={styles["menu-overlay"]}>
          <a href="/" className={styles["menu-item"]}>
            Home
          </a>
          <a href="/docker" className={styles["menu-item"]}>
            Docker
          </a>
          <a href="/prisma" className={styles["menu-item"]}>
            Prisma
          </a>
          <a href="/tests" className={styles["menu-item"]}>
            Tests
          </a>
          <a href="/about" className={styles["menu-item"]}>
            About
          </a>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
