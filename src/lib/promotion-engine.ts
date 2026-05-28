export function applyPromotionToItem({
  item,
  promotions,
}: {
  item: any;
  promotions: any[];
}) {
  const promotion = promotions.find((promo) => {
    const productMatch =
      promo.product?._id?.toString?.() === item.product?.toString?.() ||
      promo.product?.toString?.() === item.product?.toString?.();

    const categoryMatch =
      promo.category &&
      item.category &&
      promo.category === item.category;

    const brandMatch =
      promo.brand &&
      item.brand &&
      promo.brand === item.brand;

    return productMatch || categoryMatch || brandMatch;
  });

  if (!promotion) {
    return {
      ...item,
      originalSubtotal: item.subtotal,
      discount: 0,
      promotionName: "",
      subtotal: item.subtotal,
    };
  }

  const quantity = Number(item.quantity || 0);
  const unitPrice = Number(item.unitPrice || 0);
  const originalSubtotal = quantity * unitPrice;

  let newSubtotal = originalSubtotal;

  if (promotion.type === "PERCENTAGE") {
    newSubtotal =
      originalSubtotal - originalSubtotal * (Number(promotion.percentage || 0) / 100);
  }

  if (promotion.type === "FIXED_PRICE") {
    newSubtotal = Number(promotion.fixedPrice || originalSubtotal) * quantity;
  }

  if (promotion.type === "BUY_X_PAY_Y") {
    const buyQuantity = Number(promotion.buyQuantity || 0);
    const payQuantity = Number(promotion.payQuantity || 0);

    if (buyQuantity > 0 && payQuantity > 0 && quantity >= buyQuantity) {
      const promoGroups = Math.floor(quantity / buyQuantity);
      const remainingUnits = quantity % buyQuantity;

      const paidUnits = promoGroups * payQuantity + remainingUnits;

      newSubtotal = paidUnits * unitPrice;
    }
  }

  const discount = Math.max(0, originalSubtotal - newSubtotal);

  return {
    ...item,
    originalSubtotal,
    discount,
    promotionName: promotion.name,
    subtotal: newSubtotal,
  };
}

export function isPromotionActive(promotion: any) {
  const now = new Date();

  if (!promotion.isActive) return false;

  if (promotion.startsAt && new Date(promotion.startsAt) > now) {
    return false;
  }

  if (promotion.endsAt && new Date(promotion.endsAt) < now) {
    return false;
  }

  return true;
}