"use client";

// app/login/page.tsx — Redirect a home con modal de login

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/?login=1");
  }, [router]);
  return (
    <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-bg-deep">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <div className="h-6 w-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span className="text-sm text-text-muted">Redirigiendo...</span>
      </div>
    </div>
  );
}
