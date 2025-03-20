import React, { useState, useEffect, useContext } from "react";
import { useDrag } from "react-dnd";
import { ThemeContext } from "../../utils/ThemeContext";
import "./TaskCards.css";

const ITEM_TYPE = "TASK";

const TaskCards = ({ task }) => {
  const { theme } = useContext(ThemeContext);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: task.id },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  }));

  const [time, setTime] = useState(task.timeElapsed || 0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const updateTaskTime = async (updatedTime) => {
    try {
      await fetch(`http://localhost:5000/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeElapsed: updatedTime }),
      });
    } catch (error) {
      console.error("Error updating task time:", error);
    }
  };

  const handlePause = () => {
    setRunning(false);
    updateTaskTime(time);
  };

  const handleReset = () => {
    setRunning(false);
    setTime(0);
    updateTaskTime(0);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div ref={drag} className="task-card" data-theme={theme} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <h4>{task.title}</h4>
      <p>Description: {task.description}</p>
      <p>Due: {task.dueDate}</p>
      <p>Priority: {task.priority}</p>
      <p>Status: {task.status}</p>
      <p>Assigned To: {task.assignedTo}</p>
      <p>Created: {task.createdAt}</p>
      <p>Completion Time: {task.completionTime}</p>
      <div className="timer">
        <span>{formatTime(time)}</span>
        {!running && task.status !== "completed" ? (
          <button onClick={() => setRunning(true)}>Start Timer</button>
        ) : (
          <button onClick={handlePause}>Pause</button>
        )}
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default TaskCards;
