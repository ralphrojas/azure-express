const { executeQuery } = require("../utils/dbUtils");

const getAllUsers = async () => {
  return await executeQuery(`
        SELECT 
            u.USER_ID AS userId,
            u.FIRSTNAME AS firstname,
            u.LASTNAME AS lastname,
            c.CUSTOMER_ID AS customerId,
            c.NAME AS customerName,
            r.ROLE_ID AS roleId,
            r.NAME AS roleName
        FROM 
            dbo.[USER] u
        LEFT JOIN 
            dbo.CUSTOMER_USER_MAP cum ON u.USER_ID = cum.USER_ID
        LEFT JOIN 
            dbo.[CUSTOMER] c ON cum.CUSTOMER_ID = c.CUSTOMER_ID
        LEFT JOIN 
            dbo.[ROLE] r ON cum.ROLE_ID = r.ROLE_ID
        ORDER BY 
            u.USER_ID, c.CUSTOMER_ID
    `);
};

module.exports = {
  getAllUsers,
};
