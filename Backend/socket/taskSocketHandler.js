const mongoose = require("mongoose");
const Task = require("../Model/TaskModel");
const redisClient = require("../redis/redisClient");

const REDIS_KEY = "FullStack_Task_jayant";
const MONGO_LIMIT = 50;

function deduplicateTasks(tasks) {
  const map = new Map();
  tasks.forEach((task) => map.set(task._id.toString(), task));
  return Array.from(map.values());
}

const taskSocketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("add", async (data) => {
  const newTask = new Task({
    text: data.text,
    createdAt: new Date(),
  });

  await newTask.save(); 

  let redisTasks = JSON.parse((await redisClient.get(REDIS_KEY)) || "[]");
  redisTasks.push(newTask);
  await redisClient.set(REDIS_KEY, JSON.stringify(redisTasks));

  const mongoTasks = await Task.find();
  const combined = deduplicateTasks([...redisTasks, ...mongoTasks]);
  io.emit("tasksUpdated", combined);
});


    socket.on("delete", async (id) => {
      let redisTasks = JSON.parse((await redisClient.get(REDIS_KEY)) || "[]");
      redisTasks = redisTasks.filter((task) => task._id !== id);
      await redisClient.set(REDIS_KEY, JSON.stringify(redisTasks));

      await Task.findByIdAndDelete(id);
      const mongoTasks = await Task.find();
      const combined = deduplicateTasks([...redisTasks, ...mongoTasks]);
      io.emit("tasksUpdated", combined);
    });
  });
};

module.exports = taskSocketHandler;