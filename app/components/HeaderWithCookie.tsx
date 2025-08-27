"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HamburgerMenu from "./HamburgerMenu";

const menuItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Docker", path: "/docker" },
  { name: "Prisma/Sequalize", path: "/prisma" },
  { name: "Tests", path: "/tests" },
];

export default function HeaderWithCookie() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("Home");

  useEffect(() => {
    const currentItem = menuItems.find((item) => item.path === pathname);
    if (currentItem) {
      setActiveTab(currentItem.name);
      
      document.cookie = `activeTab=${currentItem.name}; path=/; max-age=${
        60 * 60 * 24 * 30
      }`;
    } else {
      const savedTab = document.cookie
        .split("; ")
        .find((row) => row.startsWith("activeTab="))
        ?.split("=")[1];
      if (savedTab && menuItems.some((item) => item.name === savedTab)) {
        setActiveTab(savedTab);
      }
    }
  }, [pathname]);

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
          <Link key={item.name} href={item.path} style={{ textDecoration: "none" }}>
            <div
              style={{
                cursor: "pointer",
                fontWeight: activeTab === item.name ? "bold" : "normal",
                borderBottom: activeTab === item.name ? "2px solid #3498db" : "none",
                color: "white",
                padding: "5px 0",
              }}
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
