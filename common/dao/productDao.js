const { executeQuery } = require("../utils/dbUtils");

const getProductPrices = async (productIds) => {
  const query = `
        SELECT product_id, price
        FROM dbo.PRODUCT
        WHERE product_id IN (${productIds.join(",")})
      `;
  return await executeQuery(query);
};

module.exports = {
  getProductPrices,
};
