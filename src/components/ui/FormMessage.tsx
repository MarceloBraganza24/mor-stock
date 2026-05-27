export function FormMessage({
  message,
  type = "success",
}: {
  message?: string;
  type?: "success" | "error";
}) {
  if (!message) return null;

  return (
    <div
      className={`rounded-xl border p-4 text-sm ${
        type === "error"
          ? "border-red-500/20 bg-red-500/10 text-red-300"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      }`}
    >
      {message}
    </div>
  );
}