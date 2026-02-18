"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSearchParams } from "next/navigation";

import Login from "@/presentation/pages/Login";
import { deleteCookie, getCookie, setCookie } from "@/infrastructure/browser/cookies";

const AUTH_COOKIE = "hms_auth";
const ROLE_COOKIE = "hms_role";
const IMPERSONATING_COOKIE = "hms_impersonating";
const IMPERSONATED_HOTEL_COOKIE = "hms_impersonated_hotel";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  useEffect(() => {
    const isAuthed = getCookie(AUTH_COOKIE) === "1";
    const role = getCookie(ROLE_COOKIE);
    if (!isAuthed) return;
    
    // If we have a 'from' path, go there, otherwise go to dashboard
    router.replace(from || (role === "hotel" ? "/hotel/dashboard" : "/super/dashboard"));
  }, [router, from]);

  return (
    <Login
      onLogin={(role) => {
        setCookie(AUTH_COOKIE, "1", { maxAgeSeconds: 60 * 60 * 8, sameSite: "lax" });
        setCookie(ROLE_COOKIE, role, { maxAgeSeconds: 60 * 60 * 8, sameSite: "lax" });
        deleteCookie(IMPERSONATING_COOKIE);
        deleteCookie(IMPERSONATED_HOTEL_COOKIE);

        router.replace(from || (role === "hotel" ? "/hotel/dashboard" : "/super/dashboard"));
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
