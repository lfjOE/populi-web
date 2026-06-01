"use client";

import { useAuth } from "@/lib/auth";
import ModalLogin from "@/components/ModalLogin";

export default function GlobalModals() {
  const { showLoginModal, setShowLoginModal } = useAuth();

  return (
    <>
      {showLoginModal && <ModalLogin onClose={() => setShowLoginModal(false)} />}
    </>
  );
}
