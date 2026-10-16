"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/src/store/authStore";
import { loginWithPortal, type ApiErrorResponse } from "@/src/lib/auth";
import { useLocaleStore } from "@/src/store/localeStore";
import { t } from "@/src/i18";

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { msgs } = useLocaleStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t(msgs, "errors.fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      const data = await loginWithPortal({ email, password, portal: "admin" });
      setAuth(data.data);
      const params = new URLSearchParams(window.location.search);
      const dest = params.get("callbackUrl") ?? "/admin/dashboard";
      router.push(dest);
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      setError(apiErr?.message || t(msgs, "errors.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border bg-card shadow-sm p-8 space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">{t(msgs, "admin.portal")}</h1>
            <p className="text-sm text-muted-foreground">
              {t(msgs, "admin.signInToManage")}
            </p>
          </div>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-sm font-medium">
                {t(msgs, "login.emailAddress")}
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8"
                  aria-required="true"
                  aria-invalid={!!error || undefined}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-sm font-medium">
                {t(msgs, "login.password")}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8 pr-10"
                  aria-required="true"
                  aria-invalid={!!error || undefined}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t(msgs, "login.hidePassword") : t(msgs, "login.showPassword")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground
                    hover:text-foreground transition-colors
                    focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 rounded"
                >
                  {showPassword
                    ? <EyeOff className="size-4" aria-hidden="true" />
                    : <Eye className="size-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive bg-destructive/10
                border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? t(msgs, "login.signingIn") : t(msgs, "login.signIn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
