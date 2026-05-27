export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {eyebrow && (
        <p className="text-sm font-medium text-emerald-400">{eyebrow}</p>
      )}
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}