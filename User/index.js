const express = require("express");
const createHandler = require("azure-function-express").createHandler;
const { connectDB } = require("../common/config/database");
const { getAllUsers } = require("../common/services/userService");

const app = express();

app.get("/api/users", async (req, res) => {
  try {
    await connectDB();
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).json({ message: "Error retrieving user data." });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    console.log("Received POST request to /api/users");
    console.log("Request body:", req.body);
    res.status(200).json({ message: "POST WORKING" });
    console.log("Response sent successfully");
  } catch (error) {
    console.error("Error processing POST request:", error);
    res.status(500).json({ message: "Error processing request." });
  }
});

module.exports = createHandler(app);
