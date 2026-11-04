"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  ["/projects", "চলমান কাজ"],
  ["/clients", "ওয়ান টাইম ক্লায়েন্ট"],
  ["/package-clients", "প্যাকেজ ক্লায়েন্ট"],
  ["/packages", "প্যাকেজ তৈরি"],
  ["/leads", "সম্ভাব্য ক্লায়েন্ট"],
];

export default function Nav() {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav className="nav noprint">
      <span className="brand">Office Manager</span>
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} className={path.startsWith(href) ? "on" : ""}>
          {label}
        </Link>
      ))}
      <span className="sp" />
      <button className="link" onClick={logout}>
        লগআউট
      </button>
    </nav>
  );
}
