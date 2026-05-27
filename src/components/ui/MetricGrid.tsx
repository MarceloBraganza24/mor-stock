export function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
      {children}
    </div>
  );
}