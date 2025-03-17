import React, { useState } from "react";
import Modal from "react-modal";
import "./DueDateModel.css";

const DueDateModel = ({ tasks, setTasks }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState({});

  const isDisabled = !title || !dueDate || !priority;

  const handleAddTask = async () => {
    const newTask = {
      id: tasks.length + 1,
      title,
      status: "Pending",
      priority,
      dueDate,
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error("Error posting task");
      }
      const savedTask = await response.json();
      setTasks([...tasks, savedTask]);
      setTitle("");
      setPriority("Low");
      setDueDate("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleView = (tasks) => {
    setSelectedTask(tasks);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (tasks) => {
    setEditedTask(tasks);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleSave = () => {
    setTasks(tasks.map((task) => (task.id === editedTask.id ? editedTask : task)));
    setModalOpen(false);
  };

  return (
    <div className="task-manager-container">
      <div className="add-task-container">
        <input
          type="text"
          placeholder="Task Title"
          className="task-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          className="task-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select
          className="task-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button 
          className={`task-button ${isDisabled ? "disabled" : ""}`} 
          onClick={handleAddTask} 
          disabled={isDisabled}
        >
          Add Task
        </button>
      </div>
      <div className="table-box">
        <table className="due-date-table">
          <thead>
            <tr>
              <th>Task Title</th>
              <th>Created On</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.createdAt}</td>
                <td>{task.dueDate}</td>
                <td>{task.priority}</td>
                <td>{task.status}</td>
                <td className="action-buttons">
                  <button onClick={() => handleView(task)} className="view-btn">View</button>
                  <button onClick={() => handleEdit(task)} className="edit-btn">Update</button>
                  <button onClick={() => handleDelete(task.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Task Details"
        overlayClassName="modal-overlay"
        className="modal-content"
        ariaHideApp={false}
      >
        <button className="modal-close-btn" onClick={() => setModalOpen(false)}>×</button>
        {editMode ? (
          <div>
            <h2>Edit Task</h2>
            <label>Title:</label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            />
            <label>Priority:</label>
            <select
              value={editedTask.priority}
              onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <label>Status:</label>
            <select
              value={editedTask.status}
              onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button onClick={handleSave} className="save-btn">Save Changes</button>
          </div>
        ) : (
          <div>
            <h2>Task Details</h2>
            {selectedTask && (
              <div>
                <p><strong>Title:</strong> {selectedTask.title}</p>
                <p><strong>Created On:</strong> {selectedTask.createdAt}</p>
                <p><strong>Due Date:</strong> {selectedTask.dueDate}</p>
                <p><strong>Priority:</strong> {selectedTask.priority}</p>
                <p><strong>Status:</strong> {selectedTask.status}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DueDateModel;
