"use client";
import { useActionState } from "react";
import { resendVerificationAction, type FormState } from "@/app/actions/auth";

export function VerifyBanner() {
  const [state, action, pending] = useActionState<FormState, FormData>(() => resendVerificationAction(), undefined);
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-warn/25 bg-warn-soft px-4 py-3 text-[14px] text-warn">
      <span>{state?.ok ?? state?.error ?? "E-posta adresinizi doğrulayın. Doğrulanmamış hesaplar teklif veremez ve hizmet yayınlayamaz."}</span>
      {!state?.ok && (
        <form action={action}>
          <button disabled={pending} className="font-medium underline underline-offset-2">{pending ? "Gönderiliyor…" : "Bağlantıyı tekrar gönder"}</button>
        </form>
      )}
    </div>
  );
}
