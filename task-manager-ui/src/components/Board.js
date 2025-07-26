import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "./Column";
import AddTaskForm from "./AddTaskForm";

const Board = () => {
  const [tasks, setTasks] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const apiUrl = "https://task-board-oo2r.onrender.com"; // Base URL

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/tasks`)
      .then((response) => setTasks(response.data))
      .catch((error) => console.error("Error fetching data: ", error));
  }, []);

  const handleAddTask = (taskToAdd) => {
    const newTask = { ...taskToAdd, status: "To Do" };
    axios
      .post(`${apiUrl}/api/tasks`, newTask)
      .then((response) => setTasks([...tasks, response.data]))
      .catch((error) => console.error("Error adding task: ", error));
  };

  const handleDeleteTask = (id) => {
    axios
      .delete(`${apiUrl}/api/tasks/${id}`)
      .then(() => setTasks(tasks.filter((task) => task.id !== id)))
      .catch((error) => console.error("Error deleting task: ", error));
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
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
    axios
      .put(`${apiUrl}/api/tasks/${draggableId}`, updatedTask)
      .catch((error) => {
        console.error("Error updating task: ", error);
        setTasks(tasks);
      });
  };

  const handleGenerateSubtasks = (task) => {
    setLoadingAI(true);
    axios
      .post(`${apiUrl}/api/ai/generate-subtasks`, task)
      .then((response) => {
        const subtasks = response.data;
        const confirmAdd = window.confirm(
          `AI generated sub-tasks:\n\n- ${subtasks.join(
            "\n- "
          )}\n\nDo you want to add them to the board?`
        );
        if (confirmAdd) {
          const newTasksToAdd = subtasks.map((title) => ({
            title: title,
            description: `Sub-task of '${task.title}'`,
            status: "To Do",
          }));
          Promise.all(
            newTasksToAdd.map((t) => axios.post(`${apiUrl}/api/tasks`, t))
          ).then(() => {
            // Re-fetch all tasks to get the new ones
            axios.get(`${apiUrl}/api/tasks`).then((res) => setTasks(res.data));
          });
        }
      })
      .catch((error) => {
        console.error("Error generating sub-tasks: ", error);
        alert("Failed to generate sub-tasks from AI.");
      })
      .finally(() => {
        setLoadingAI(false);
      });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="board-container">
        {loadingAI && (
          <div className="loading-overlay">🤖 Generating AI Sub-tasks...</div>
        )}
        <h1>My Task Board</h1>
        <AddTaskForm onTaskAdd={handleAddTask} />
        <hr />
        <div className="board">
          <Column
            title="To Do"
            tasks={tasks.filter((task) => task.status === "To Do")}
            onDeleteTask={handleDeleteTask}
            onGenerateSubtasks={handleGenerateSubtasks}
          />
          <Column
            title="In Progress"
            tasks={tasks.filter((task) => task.status === "In Progress")}
            onDeleteTask={handleDeleteTask}
            onGenerateSubtasks={handleGenerateSubtasks}
          />
          <Column
            title="Done"
            tasks={tasks.filter((task) => task.status === "Done")}
            onDeleteTask={handleDeleteTask}
            onGenerateSubtasks={handleGenerateSubtasks}
          />
        </div>
      </div>
    </DragDropContext>
  );
};

export default Board;
