const productDao = require("../dao/productDao");

const getProductPrices = async (items) => {
  const productIds = items.map((detail) => detail.productId);
  const { recordset: productPrices } = await productDao.getProductPrices(
    productIds
  );

  if (productPrices.length !== productIds.length) {
    const missingProductIds = productIds.filter(
      (id) => !productPrices.some((product) => product.product_id == id)
    );
    throw new Error(
      `Product(s) with ID(s) ${missingProductIds.join(", ")} not found.`
    );
  }

  const itemsWithPrice = items.map((item) => {
    const priceItem = productPrices.find(
      (price) => price.product_id === Number(item.productId)
    );
    return {
      ...item,
      price: priceItem ? priceItem.price : null,
    };
  });
  return itemsWithPrice;
};

module.exports = {
  getProductPrices,
};
