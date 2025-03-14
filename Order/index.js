const { connectDB } = require("../common/config/database");
const { getAllOrders } = require("../common/services/orderService");

module.exports = async function (context, req) {
  try {
    await connectDB();
    const res = await getAllOrders();
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: res,
    };
  } catch (error) {
    context.log.error("Error retrieving order data:", error);
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: "Error retrieving order data.",
    };
  }
};
