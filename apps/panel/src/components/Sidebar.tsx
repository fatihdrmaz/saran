"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth";
import { nameInitials } from "../lib/queries";

type NavItem = { href: string; label: string; icon: string };

const MAIN: NavItem[] = [
  { href: "/", label: "Bugün", icon: "M4 5h16v16H4zM4 9h16M9 3v3M15 3v3" },
  { href: "/hastalar", label: "Hastalar", icon: "M3 20a6 6 0 0 1 12 0M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M16 11a3 3 0 1 0 0-6M21 20a5 5 0 0 0-7-4.6" },
  { href: "/gelen-kutusu", label: "Gelen kutusu", icon: "M3 5h18v14H3zM3 6l9 7 9-7" },
  { href: "/randevular", label: "Randevular", icon: "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4" },
  { href: "/sablonlar", label: "Şablonlar", icon: "M5 3h10l4 4v14H5zM14 3v5h5" },
  { href: "/kazanc", label: "Kazanç", icon: "M3 18l5-6 4 4 7-9M3 20h18" },
];

const ADMIN: NavItem[] = [
  { href: "/ekip", label: "Ekip · Hemşireler", icon: "M3 20a6 6 0 0 1 12 0M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" },
  { href: "/blog", label: "Blog", icon: "M5 3h10l4 4v14H5zM14 3v5h5M8 13h8M8 17h5" },
  { href: "/yorumlar", label: "Yorumlar", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { href: "/urunler", label: "Ürünler", icon: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname() || "/";
  const { user, signOut } = useAuth();
  const displayName = user?.fullName || user?.email || "Hemşire";
  const initials = nameInitials(displayName);
  // Yönetim menüsü yalnızca admin rolüne görünür (hemşire görmez).
  const isAdmin = user?.role === "admin";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const renderItem = (it: NavItem) => {
    const active = isActive(it.href);
    return (
      <Link
        key={it.href}
        href={it.href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: active ? 700 : 500,
          color: active ? "#fff" : "#9fc4ba",
          background: active ? "var(--primary-mid)" : "transparent",
          whiteSpace: "nowrap",
        }}
      >
        <Icon d={it.icon} />
        <span>{it.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className="panel-sidebar"
      style={{
        width: 250,
        flexShrink: 0,
        background: "var(--primary-dark)",
        color: "#fff",
        padding: "22px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 12px 18px",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "var(--primary-mid)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          YT
        </div>
        <div>
          <div className="serif" style={{ fontSize: 19, fontWeight: 600 }}>
            Yara Takibi
          </div>
          <div style={{ fontSize: 11, color: "#7fd8c4" }}>Hemşire Paneli</div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {MAIN.map(renderItem)}
      </nav>

      {isAdmin && (
        <>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.6,
              color: "#5e8378",
              textTransform: "uppercase",
              padding: "18px 12px 6px",
            }}
          >
            Yönetim
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {ADMIN.map(renderItem)}
          </nav>
        </>
      )}

      <div style={{ marginTop: "auto", padding: "16px 12px 4px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "var(--teal-light)",
              color: "var(--primary-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ lineHeight: 1.3, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: "#7fd8c4" }}>
              {user?.specialty ?? "Hemşire"}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            void signOut();
          }}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "9px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.18)",
            background: "transparent",
            color: "#cfe9e1",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Çıkış yap
        </button>
      </div>
    </aside>
  );
}
