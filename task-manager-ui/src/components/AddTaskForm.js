import React, { useState } from "react";

const AddTaskForm = ({ onTaskAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // Page ko refresh hone se rokein
    if (!title) {
      alert("Title is required!");
      return;
    }
    // Parent component (Board) ko naya task data bhejein
    onTaskAdd({ title, description });

    // Form ko reset karein
    setTitle("");
    setDescription("");
  };

  return (
    <div className="add-task-form">
      <h3>Add New Task</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
};

export default AddTaskForm;
