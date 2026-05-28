export function calculatePromotionPreview({
  item,
  promotions,
}: {
  item: any;
  promotions: any[];
}) {
  const promotion = promotions.find((promo) => {
    const productMatch =
      promo.product === item.productId;

    const categoryMatch =
      promo.category &&
      promo.category === item.category;

    const brandMatch =
      promo.brand &&
      promo.brand === item.brand;

    return (
      productMatch ||
      categoryMatch ||
      brandMatch
    );
  });

  if (!promotion) {
    return {
      ...item,
      finalSubtotal: item.subtotal,
      originalSubtotal: item.subtotal,
      discount: 0,
      promotionName: "",
    };
  }

  const quantity = Number(item.quantity || 0);
  const unitPrice = Number(item.unitPrice || 0);

  const originalSubtotal =
    quantity * unitPrice;

  let finalSubtotal = originalSubtotal;

  if (promotion.type === "PERCENTAGE") {
    finalSubtotal =
      originalSubtotal -
      originalSubtotal *
        (Number(
          promotion.percentage || 0
        ) /
          100);
  }

  if (promotion.type === "FIXED_PRICE") {
    finalSubtotal =
      Number(
        promotion.fixedPrice || unitPrice
      ) * quantity;
  }

  if (promotion.type === "BUY_X_PAY_Y") {
    const buy =
      Number(
        promotion.buyQuantity || 0
      );

    const pay =
      Number(
        promotion.payQuantity || 0
      );

    if (
      buy > 0 &&
      pay > 0 &&
      quantity >= buy
    ) {
      const groups =
        Math.floor(quantity / buy);

      const remainder =
        quantity % buy;

      const paidUnits =
        groups * pay + remainder;

      finalSubtotal =
        paidUnits * unitPrice;
    }
  }

  return {
    ...item,
    finalSubtotal,
    originalSubtotal,
    discount:
      originalSubtotal -
      finalSubtotal,
    promotionName:
      promotion.name || "",
  };
}