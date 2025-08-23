"use client";

import { useState, useEffect } from "react";
import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  return (
    <header className="header-mockup">
      <div className="student-number">Git Helper Web App</div>
      <div className="student-number">Student ID: 22162832</div>
    </header>
  );
}
