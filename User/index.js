const { connectDB } = require("../common/config/database");
const { getAllUsers } = require("../common/services/userService");

module.exports = async function (context, req) {
  try {
    await connectDB();
    const res = await getAllUsers();
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: res,
    };
  } catch (error) {
    context.log.error("Error retrieving user data:", error);
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: "Error retrieving user data.",
    };
  }
};
