"use client";

import { useState } from "react";
import { Button, Card } from "../../components/ui";
import { useAuth } from "../../lib/auth";

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid var(--card-border)",
  borderRadius: 10,
  background: "#fff",
  fontSize: 14,
} as const;

const labelStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-heading)",
  marginBottom: 6,
  display: "block",
} as const;

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) setError(error);
    // Başarılıysa auth guard otomatik /'e yönlendirir.
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--surface)",
      }}
    >
      <Card style={{ maxWidth: 400, width: "100%", padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--primary)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 20,
              marginBottom: 12,
            }}
          >
            S
          </div>
          <h1
            className="serif"
            style={{ fontSize: 24, fontWeight: 600, color: "var(--text-heading)" }}
          >
            Yara Takibi Paneli
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 13.5 }}>
            Hemşire & admin girişi
          </p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>E-posta</label>
            <input
              type="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hemsire@saran.app"
              autoComplete="email"
              required
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Parola</label>
            <input
              type="password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div
              style={{
                color: "var(--danger)",
                fontSize: 13,
                marginBottom: 12,
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Giriş yapılıyor…" : "Giriş yap"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
