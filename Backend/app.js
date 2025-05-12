const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const taskSocketHandler = require("./socket/taskSocketHandler");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/Assignment_jayant")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));


app.use("/", taskRoutes);


taskSocketHandler(io);

server.listen(12675, () => {
  console.log("Server running at http://localhost:12675");
});
