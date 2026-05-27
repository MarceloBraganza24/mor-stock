"use client";

import { useState, useTransition } from "react";

export function StoreLogoUpload({
  defaultLogoUrl = "",
}: {
  defaultLogoUrl?: string;
}) {
  const [logoUrl, setLogoUrl] = useState(defaultLogoUrl);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleUpload(file: File) {
    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/store-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al subir logo");
        return;
      }

      setLogoUrl(data.url);
    });
  }

  return (
    <div className="app-card-2xl p-5">
      <p className="text-sm font-medium text-white/70">Logo del comercio</p>

      {logoUrl && (
        <img
          src={logoUrl}
          alt="Logo"
          className="mt-4 h-24 w-24 rounded-2xl object-cover"
        />
      )}

      <input type="hidden" name="logoUrl" value={logoUrl} />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        className="mt-4 w-full app-input"
      />

      {isPending && <p className="mt-2 text-sm app-muted">Subiendo...</p>}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}