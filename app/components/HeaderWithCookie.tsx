"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HamburgerMenu from "./HamburgerMenu";

const menuItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Docker", path: "/docker" },
  { name: "Prisma/Sequalize", path: "/prisma" },
  { name: "Tests", path: "/tests" },
];

export default function HeaderWithCookie() {
  const [activeTab, setActiveTab] = useState("Home");

  useEffect(() => {
    const savedTab = document.cookie
      .split("; ")
      .find((row) => row.startsWith("activeTab="))
      ?.split("=")[1];
    if (savedTab && menuItems.some((item) => item.name === savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    document.cookie = `activeTab=${activeTab}; path=/; max-age=${
      60 * 60 * 24 * 30
    }`;
  }, [activeTab]);

  const handleItemClick = (name: string) => {
    setActiveTab(name);
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#2c3e50",
        color: "white",
        padding: "10px 20px",
      }}
    >
      <nav style={{ display: "flex", gap: "20px" }}>
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                cursor: "pointer",
                fontWeight: activeTab === item.name ? "bold" : "normal",
                borderBottom:
                  activeTab === item.name ? "2px solid #3498db" : "none",
                color: "white",
                padding: "5px 0",
              }}
              onClick={() => handleItemClick(item.name)}
            >
              {item.name}
            </div>
          </Link>
        ))}
      </nav>

      <HamburgerMenu />
    </header>
  );
}
