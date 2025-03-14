const userDao = require("../dao/userDao");

const getAllUsers = async () => {
  const result = await userDao.getAllUsers();
  const userMap = new Map();

  result.recordset.forEach((row) => {
    const {
      userId,
      firstname,
      lastname,
      customerId,
      customerName,
      roleId,
      roleName,
    } = row;

    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId,
        firstname,
        lastname,
        customers: [],
      });
    }

    const user = userMap.get(userId);

    if (customerId && customerName && roleId && roleName) {
      user.customers.push({
        customerId,
        customerName,
        role: {
          roleId,
          roleName,
        },
      });
    }
  });

  return [...userMap.values()];
};

module.exports = {
  getAllUsers,
};
