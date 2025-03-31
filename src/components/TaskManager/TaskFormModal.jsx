import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../utils/ThemeContext";
import "./TaskFormModal.css";
import axiosInstance from "../../utils/axiosInstance";

const TaskFormModal = ({ onClose, onSave }) => {
  const { theme } = useContext(ThemeContext);
  const [taskTitle, setTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [assignedTo, setAssignedTo] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axiosInstance.get("/teams");
        setTeam(response.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  const handleSubmit = () => {
    onSave({ title: taskTitle, dueDate, priority, assignedTo, shared: isShared });
    onClose();
  };

  return (
    <div className="modal-main" data-theme={theme}>
      <div className="modal-container">
        <h2 className="modal-title">Create Task</h2>
        <input
          type="text"
          placeholder="Task Title"
          className="modal-input"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />
        <input
          type="date"
          className="modal-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select className="modal-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select className="modal-input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
          <option value="">Assign to</option>
          {team.map((member) => (
            <option key={member._id} value={member._id}>{member.name}</option>
          ))}
        </select>
        <label className="modal-checkbox">
          <input type="checkbox" checked={isShared} onChange={() => setIsShared(!isShared)} />
          Shared Task
        </label>
        <div className="modal-actions">
          <button className="modal-button save" onClick={handleSubmit}>Save</button>
          <button className="modal-button cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
