import React from "react";
// Badlav yahan hai: react-beautiful-dnd se @hello-pangea/dnd mein badla gaya
import { Draggable } from "@hello-pangea/dnd";

const TaskCard = ({ task, onDelete, index, onGenerateSubtasks }) => {
  const getCardStyle = (status) => {
    switch (status) {
      case "To Do":
        return "status-todo";
      case "In Progress":
        return "status-inprogress";
      case "Done":
        return "status-done";
      default:
        return "";
    }
  };

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided) => (
        <div
          className={`task-card ${getCardStyle(task.status)}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <button className="delete-button" onClick={() => onDelete(task.id)}>
            X
          </button>
          <h4>{task.title}</h4>
          <p>{task.description}</p>
          <button
            className="ai-button"
            onClick={() => onGenerateSubtasks(task)}
          >
            ✨ AI Sub-tasks
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
