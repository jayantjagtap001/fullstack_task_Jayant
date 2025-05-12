const express = require("express");
const router = express.Router();
const Task = require("../Model/TaskModel");
const redisClient = require("../redis/redisClient");

const REDIS_KEY = " Fullstack Task_jayant";

router.get("/fetchAllTasks", async (req, res) => {
  try {
    const mongoTasks = await Task.find();
    res.json(mongoTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Error fetching tasks");
  }
});


module.exports = router;
