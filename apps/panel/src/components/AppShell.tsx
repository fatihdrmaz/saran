"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "../lib/auth";
import { Sidebar } from "./Sidebar";

/** Giriş ekranı (ve auth yüklenirken) sidebar olmadan tam ekran gösterilir. */
function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const { loading, session } = useAuth();
  const isLogin = pathname.startsWith("/giris");

  if (isLogin || (!session && !loading)) {
    return (
      <main style={{ minHeight: "100vh" }}>{children}</main>
    );
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        Yükleniyor…
      </main>
    );
  }

  return (
    <div className="panel-shell" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main className="panel-main" style={{ flex: 1, padding: 32, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  );
}
