export function calculateComboSubtotal({
  quantity,
  comboPrice,
}: {
  quantity: number;
  comboPrice: number;
}) {
  return Number(quantity || 0) * Number(comboPrice || 0);
}