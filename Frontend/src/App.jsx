import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./App.css";

const socket = io("http://localhost:12675");

function deduplicateTasks(tasks) {
  const map = new Map();
  tasks.forEach((task) => map.set(task._id, task));
  return Array.from(map.values());
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");

  useEffect(() => {
    axios.get("http://localhost:12675/fetchAllTasks").then((response) => {
      setTasks(deduplicateTasks(response.data));
    });

    socket.on("tasksUpdated", (updatedTasks) => {
      setTasks(deduplicateTasks(updatedTasks));
    });

    return () => socket.off("tasksUpdated");
  }, []);

  const addTask = () => {
    if (taskText.trim()) {
      socket.emit("add", { text: taskText });
      setTaskText("");
    }
  };

  const deleteTask = (id) => {
    socket.emit("delete", id);
  };

  return (
    <div className="note-app">
      <div className="header">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7Fu1P2lrAxJoQzUtSzc7yRZ6PwniywGahkdPfLiKilkLuzR5gSwv8OVdLuz2K2haFjQU&usqp=CAU"
          alt="Note Icon"
          className="icon"
        />
        <h1>Note App</h1>
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="New Note..."
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />
        <button className="add-btn" onClick={addTask}>
          <span className="plus-icon">+</span> Add
        </button>
      </div>

      <h2>Notes</h2>
      <div className="notes-list">
        {tasks.map((task) => (
          <div key={task._id} className="note-item">
            <div className="note-text">{task.text}</div>
            {/* <small className="note-time">
              {new Date(task.createdAt).toLocaleString()}
            </small> */}
            {/* <button className="delete-btn" onClick={() => deleteTask(task._id)}>
              Delete
            </button> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
