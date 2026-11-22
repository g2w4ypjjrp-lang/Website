"use client";
import { ErrorView } from "@/components/error-view";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="container-x"><ErrorView error={error} reset={reset} home="/panel" /></div>;
}
