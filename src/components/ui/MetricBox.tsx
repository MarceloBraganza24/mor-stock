export function MetricBox({
  title,
  value,
  subtitle,
  danger,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
      <p className="text-xs uppercase tracking-wide text-white/40 sm:text-sm">
        {title}
      </p>

      <h2
        className={`mt-3 text-2xl font-bold sm:text-3xl ${
          danger ? "text-red-400" : "text-white"
        }`}
      >
        {value}
      </h2>

      {subtitle && <p className="mt-2 text-sm text-white/40">{subtitle}</p>}
    </div>
  );
}