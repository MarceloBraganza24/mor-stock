export function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
      {message}
    </div>
  );
}