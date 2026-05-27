type TableContainerProps = {
  children: React.ReactNode;
  minWidth?: string;
};

export function TableContainer({
  children,
  minWidth = "900px",
}: TableContainerProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="overflow-x-auto">
        <div style={{ minWidth }}>{children}</div>
      </div>
    </div>
  );
}