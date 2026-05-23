type TableContainerProps = {
  children: React.ReactNode;
  minWidth?: string;
};

export function TableContainer({
  children,
  minWidth = "900px",
}: TableContainerProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}