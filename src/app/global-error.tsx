"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="tr">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f6f4ef", color: "#14161a", padding: 32 }}>
        <h1 style={{ fontSize: 28 }}>Beklenmeyen bir hata oluştu.</h1>
        <p>Sayfayı yenilemeyi deneyin. Sorun sürerse destek ekibimize yazın.</p>
        <button onClick={reset} style={{ marginTop: 16, padding: "10px 16px", background: "#14161a", color: "#fff", border: 0, borderRadius: 6 }}>Tekrar dene</button>
      </body>
    </html>
  );
}
