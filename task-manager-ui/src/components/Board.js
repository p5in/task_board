import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "./Column";
import AddTaskForm from "./AddTaskForm";

const Board = () => {
  const [tasks, setTasks] = useState([]);
  const apiUrl = "https://task-board-oo2r.onrender.com/api/tasks";

  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => setTasks(response.data))
      .catch((error) => console.error("Error fetching data: ", error));
  }, []);

  const handleAddTask = (taskToAdd) => {
    const newTask = { ...taskToAdd, status: "To Do" };
    axios
      .post(apiUrl, newTask)
      .then((response) => setTasks([...tasks, response.data]))
      .catch((error) => console.error("Error adding task: ", error));
  };

  const handleDeleteTask = (id) => {
    axios
      .delete(`${apiUrl}/${id}`)
      .then(() => setTasks(tasks.filter((task) => task.id !== id)))
      .catch((error) => console.error("Error deleting task: ", error));
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Agar column ke bahar drop kiya to kuch na karein
    if (!destination) return;

    // Agar usi jagah wapas drop kiya to kuch na karein
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find((t) => t.id === parseInt(draggableId));
    const updatedTask = { ...task, status: destination.droppableId };

    // UI ko turant update karein
    const newTasks = tasks.map((t) =>
      t.id === updatedTask.id ? updatedTask : t
    );
    setTasks(newTasks);

    // Backend ko update karein
    axios.put(`${apiUrl}/${draggableId}`, updatedTask).catch((error) => {
      console.error("Error updating task: ", error);
      // Agar error aaye to UI ko wapas purani state par le jayein
      setTasks(tasks);
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="board-container">
        <h1>My Task Board</h1>
        <AddTaskForm onTaskAdd={handleAddTask} />
        <hr />
        <div className="board">
          <Column
            title="To Do"
            tasks={tasks.filter((task) => task.status === "To Do")}
            onDeleteTask={handleDeleteTask}
          />
          <Column
            title="In Progress"
            tasks={tasks.filter((task) => task.status === "In Progress")}
            onDeleteTask={handleDeleteTask}
          />
          <Column
            title="Done"
            tasks={tasks.filter((task) => task.status === "Done")}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>
    </DragDropContext>
  );
};

export default Board;
