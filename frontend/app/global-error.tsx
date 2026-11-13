"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body>
        <main style={{ fontFamily: "Arial, sans-serif", padding: "48px", textAlign: "center" }}>
          <p style={{ color: "#00A6D6", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Error institucional
          </p>
          <h1 style={{ color: "#0f172a", fontSize: "32px", margin: "12px 0" }}>No se pudo cargar el observatorio</h1>
          <p style={{ color: "#475569" }}>Actualiza la pagina o vuelve a intentar en unos segundos.</p>
          <button
            style={{ background: "#004B9B", border: 0, borderRadius: "6px", color: "#fff", cursor: "pointer", fontWeight: 700, marginTop: "24px", padding: "10px 16px" }}
            type="button"
            onClick={reset}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
