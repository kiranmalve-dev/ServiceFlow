"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Zap } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { useCustomerAuthStore } from "@/src/store/customerAuthStore";
import { loginWithPortal, type ApiErrorResponse } from "@/src/lib/auth";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackUrl?: string;
  onSuccess?: () => void;
}

export default function LoginDialog({
  open,
  onOpenChange,
  callbackUrl,
  onSuccess,
}: LoginDialogProps) {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useCustomerAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (open && isAuthenticated) {
      onOpenChange(false);
    }
  }, [open, isAuthenticated, onOpenChange]);

  useEffect(() => {
    if (!open) {
      reset();
      setApiError(null);
      setShowPassword(false);
    }
  }, [open, reset]);

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);
    try {
      const data = await loginWithPortal({
        email: values.email,
        password: values.password,
        portal: "customer",
      });
      setAuth(data.data);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      } else if (callbackUrl) {
        router.push(callbackUrl);
      }
    } catch (err) {
      const apiErr = err as ApiErrorResponse;
      setApiError(apiErr?.message ?? "Invalid email or password. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0">
        <div className="p-6 space-y-5">
          <DialogHeader className="items-center text-center">
            <div
              className="inline-flex h-12 w-12 items-center justify-center
                rounded-full bg-blue-100 mx-auto mb-1"
            >
              <Zap className="size-6 text-blue-600" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl font-bold text-zinc-900">
              Welcome back
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Sign in to manage your bookings
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <form
            id="login-dialog-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="dlg-email"
                className="text-sm font-medium text-zinc-700"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="dlg-email"
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={!!errors.email || undefined}
                  aria-describedby={errors.email ? "dlg-email-error" : undefined}
                  className="pl-8"
                  {...register("email", {
                    onChange: () => setApiError(null),
                  })}
                />
              </div>
              {errors.email && (
                <p id="dlg-email-error" role="alert" className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="dlg-password"
                className="text-sm font-medium text-zinc-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="dlg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  aria-required="true"
                  aria-invalid={!!errors.password || undefined}
                  aria-describedby={errors.password ? "dlg-password-error" : undefined}
                  className="pl-8 pr-9"
                  {...register("password", {
                    onChange: () => setApiError(null),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground
                    hover:text-foreground transition-colors
                    focus:outline-2 focus:outline-blue-600 rounded"
                >
                  {showPassword ? (
                    <EyeOff size={15} aria-hidden="true" />
                  ) : (
                    <Eye size={15} aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="dlg-password-error" role="alert" className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {apiError && (
              <p
                role="alert"
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20
                  rounded-lg px-3 py-2"
              >
                {apiError}
              </p>
            )}
          </form>
        </div>

        {/* Footer — kept outside the padded area to use the muted bar */}
        <div
          className="-mx-0 flex flex-col gap-3 rounded-b-xl border-t
            bg-zinc-50 px-6 py-4"
        >
          <button
            type="submit"
            form="login-dialog-form"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm
              hover:bg-blue-700 active:bg-blue-800
              disabled:opacity-60 disabled:cursor-not-allowed
              focus:outline-2 focus:outline-offset-2 focus:outline-blue-800
              transition-colors"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <a
              href="/customer/register"
              className="text-blue-600 font-medium hover:underline
                focus:outline-2 focus:outline-blue-600 rounded"
              onClick={() => onOpenChange(false)}
            >
              Sign up free
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
