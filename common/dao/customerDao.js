const { executeQuery } = require("../utils/dbUtils");

const getCustomer = async (customerId = null) => {
  try {
    let query = `
            SELECT 
                c.CUSTOMER_ID AS customerId,
                c.NAME AS customerName,
                u.USER_ID AS userId,
                u.FIRSTNAME AS firstname,
                u.LASTNAME AS lastname,
                r.ROLE_ID AS roleId,
                r.NAME AS roleName
            FROM 
                dbo.[CUSTOMER] c
            LEFT JOIN 
                dbo.CUSTOMER_USER_MAP cum ON c.CUSTOMER_ID = cum.CUSTOMER_ID
            LEFT JOIN 
                dbo.[USER] u ON cum.USER_ID = u.USER_ID
            LEFT JOIN 
                dbo.[ROLE] r ON cum.ROLE_ID = r.ROLE_ID
    `;

    if (customerId) {
      query += ` WHERE c.CUSTOMER_ID = @customerId`;
    }

    query += ` ORDER BY c.CUSTOMER_ID, u.FIRSTNAME;`;

    return await executeQuery(query, customerId ? { customerId } : {});
  } catch (error) {
    throw new Error(`Error in getCustomer: ${error.message}`);
  }
};

const createCustomer = async (customerData) => {
  try {
    const { name } = customerData;
    return await executeQuery(
      `
      INSERT INTO dbo.[CUSTOMER] (NAME)
      OUTPUT INSERTED.CUSTOMER_ID AS customerId, INSERTED.NAME AS customerName
      VALUES (@name)
    `,
      { name }
    );
  } catch (error) {
    throw new Error(`Error in createCustomer: ${error.message}`);
  }
};

const updateCustomer = async (customerId, customerData) => {
  try {
    const { name } = customerData;
    return await executeQuery(
      `
      UPDATE dbo.[CUSTOMER]
      SET NAME = @name
      OUTPUT INSERTED.CUSTOMER_ID AS customerId, INSERTED.NAME AS customerName
      WHERE CUSTOMER_ID = @customerId
    `,
      { customerId, name }
    );
  } catch (error) {
    throw new Error(`Error in updateCustomer: ${error.message}`);
  }
};

module.exports = {
  getCustomer,
  createCustomer,
  updateCustomer,
};
