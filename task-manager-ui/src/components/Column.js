import React from "react";
// Badlav yahan hai: react-beautiful-dnd se @hello-pangea/dnd mein badla gaya
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

const Column = ({ title, tasks, onDeleteTask }) => {
  return (
    <div className="column">
      <h2>{title}</h2>
      <Droppable droppableId={title}>
        {(provided) => (
          <div
            className="task-list"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
