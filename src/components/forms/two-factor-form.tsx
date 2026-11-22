"use client";
import { useActionState } from "react";
import { verifyTwoFactorAction, type FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Field, Notice } from "@/components/ui/primitives";

export function TwoFactorForm() {
  const [state, action] = useActionState<FormState, FormData>(verifyTwoFactorAction, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      {state?.error && <Notice tone="bad">{state.error}</Notice>}
      <Field label="6 haneli kod" htmlFor="code" error={state?.fieldErrors?.code}>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} autoFocus required className="field text-center font-mono text-[22px] tracking-[0.5em]" />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="Doğrulanıyor">Doğrula ve giriş yap</SubmitButton>
    </form>
  );
}
