const customerDao = require("../dao/customerDao");

const getCustomer = async (customerId = null) => {
  try {
    const result = await customerDao.getCustomer(customerId);
    const customerMap = new Map();

    result.recordset.forEach((row) => {
      const {
        customerId,
        customerName,
        userId,
        firstname,
        lastname,
        roleId,
        roleName,
      } = row;

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customerId,
          customerName,
          users: [],
        });
      }

      const customer = customerMap.get(customerId);

      if (userId && firstname && lastname && roleId && roleName) {
        customer.users.push({
          userId,
          firstname,
          lastname,
          role: {
            roleId,
            roleName,
          },
        });
      }
    });

    return [...customerMap.values()];
  } catch (error) {
    throw new Error(`Error in getCustomer: ${error.message}`);
  }
};

const createCustomer = async (customerData) => {
  try {
    console.log("Creating customer:", customerData);
    const result = await customerDao.createCustomer(customerData);
    return result.recordset[0];
  } catch (error) {
    throw new Error(`Error in createCustomer: ${error.message}`);
  }
};

const updateCustomer = async (customerId, customerData) => {
  try {
    const result = await customerDao.updateCustomer(customerId, customerData);
    if (result.recordset.length === 0) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }
    return result.recordset[0];
  } catch (error) {
    throw new Error(`Error in updateCustomer: ${error.message}`);
  }
};

module.exports = {
  getCustomer,
  createCustomer,
  updateCustomer,
};
