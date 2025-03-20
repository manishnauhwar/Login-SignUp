import React, { useContext, useState } from "react";
import Modal from "react-modal";
import "./DueDateModel.css";
import { ThemeContext } from "../../utils/ThemeContext";
import Navbar from "../Navbar/Navbar";

const DueDateModel = ({ tasks, setTasks, searchQuery }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const { theme } = useContext(ThemeContext);

  const isDisabled = !title || !dueDate || !priority;

  const handleAddTask = async () => {
    const newTask = {
      id: tasks.length + 1,
      title,
      status: "Pending",
      priority,
      dueDate,
      createdAt: new Date().toISOString().split("T")[0],
      comment: " ",
    };

    try {
      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error("Error posting task");
      const savedTask = await response.json();
      setTasks([...tasks, savedTask]);
      setTitle("");
      setPriority("Low");
      setDueDate("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleCommentChange = async (taskId, comment) => {
    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) throw new Error("Failed to update comment");
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, comment } : task)));
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleView = (task) => {
    setSelectedTask(task);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (task) => {
    setEditedTask(task);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/tasks/${editedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedTask),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();

      setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
      setModalOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleToggleStatus = async (taskId, status) => {
    const newStatus = status === "Completed" ? "Pending" : "Completed";
    try {
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to toggle status");

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="task-manager-container" data-theme={theme}>
      <div className="add-task-container">
        <input type="text" placeholder="Task Title" className="task-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="date" className="task-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <select className="task-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button className={`task-button ${isDisabled ? "disabled" : ""}`} onClick={handleAddTask} disabled={isDisabled}>
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
              <th>Comment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} onClick={() => handleView(task)} style={{ cursor: "pointer" }}>
                <td>{task.title}</td>
                <td>{task.createdAt}</td>
                <td>{task.dueDate}</td>
                <td>{task.priority}</td>
                <td>{task.status}</td>
                <td className="action-buttons">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(task); }} className="edit-btn">Update</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="delete-btn">Delete</button>
                </td>
                <td>
                  <input
                    type="text"
                    className="comment-input"
                    value={task.comment || ""}
                    placeholder="Add a comment"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleCommentChange(task.id, e.target.value)}
                  />
                </td>
                <td>
                  <div className={`custom-toggle ${task.status === "Completed" ? "completed" : "pending"}`} onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(task.id, task.status);
                  }}>
                    <div className="toggle-circle"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} contentLabel="Task Details" overlayClassName="modal-overlay" className="modal-content" ariaHideApp={false}>
        <button className="modal-close-btn" onClick={() => setModalOpen(false)}>×</button>
        {editMode ? (
          <div>
            <h2>Edit Task</h2>
            <input type="text" value={editedTask.title} onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })} />
            <select value={editedTask.priority} onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
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
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DueDateModel;
