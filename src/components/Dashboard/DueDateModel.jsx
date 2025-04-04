import React, { useContext, useState, useEffect } from "react";
import Modal from "react-modal";
import "./DueDateModel.css";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";

const DueDateModel = ({ tasks = [], setTasks, searchQuery, userId, userRole }) => {
  const [formData, setFormData] = useState({ title: "", priority: "Low", dueDate: "" });
  const [modalState, setModalState] = useState({ isOpen: false, selectedTask: null, editMode: false, editedTask: {} });
  const { theme } = useContext(ThemeContext);
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const isDisabled = !formData.title || !formData.dueDate || !formData.priority;
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (userRole === 'manager') {
        try {
          const response = await axiosInstance.get('/teams');
          const teams = response.data;
          const userTeam = teams.find(team => team.manager._id === userId);
          if (userTeam) {
            setTeamMembers(userTeam.members.map(member => member._id));
          }
        } catch (error) {
          console.error('Error fetching team members:', error);
        }
      }
    };

    if (userId && userRole) {
      fetchTeamMembers();
    }
  }, [userId, userRole]);

  const refreshTasks = async () => {
    try {
      const response = await axiosInstance.get("/tasks");
      if (response.data) {
        const transformedTasks = response.data.map((task) => ({
          id: task._id,
          title: task.title || "",
          description: task.description || "",
          status: task.status || "To Do",
          priority: task.priority || "Low",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
          createdAt: task.createdAt ? new Date(task.createdAt).toISOString().split("T")[0] : "",
          assignedTo: task.assignedTo || "",
          userId: task.userId
        }));

        let filteredTasks = transformedTasks;
        if (userRole === "user") {
          filteredTasks = transformedTasks.filter(task =>
            task.assignedTo === userId || task.userId === userId
          );
        } else if (userRole === "manager") {
          filteredTasks = transformedTasks.filter(task =>
            task.assignedTo === userId || task.userId === userId || teamMembers.includes(task.assignedTo)
          );
        }

        setTasks(filteredTasks);
      }
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData.googleId || userData._id || userData.id;
    const newTask = {
      ...formData,
      description: "No description provided",
      status: "To Do",
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString().split("T")[0],
      assignedTo: userId,
      userId: userId
    };
    try {
      await axiosInstance.post("/tasks/post", newTask);
      setFormData({ title: "", priority: "Low", dueDate: "" });
      refreshTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      alert(error.response?.data?.error?.message || "Failed to add task. Please try again.");
    }
  };

  const handleView = (task) => {
    setModalState((prev) => ({ ...prev, isOpen: true, selectedTask: task, editMode: false }));
  };

  const handleEdit = (task) => {
    setModalState((prev) => ({
      ...prev,
      isOpen: true,
      selectedTask: task,
      editMode: true,
      editedTask: { ...task, dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "" }
    }));
  };

  const handleDelete = async (taskId) => {
    if (userRole !== "admin" && userRole !== "manager") {
      alert("Only administrators and managers can delete tasks");
      return;
    }
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      refreshTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };

  const handleSave = async () => {
    try {
      const updatedTask = {
        ...modalState.editedTask,
        dueDate: modalState.editedTask.dueDate
      };
      await axiosInstance.put(`/tasks/${modalState.editedTask.id}`, updatedTask);
      setModalState((prev) => ({ ...prev, isOpen: false }));
      refreshTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleToggleStatus = async (taskId, status) => {
    const newStatus = status === "Completed" ? "To Do" : "Completed";
    try {
      await axiosInstance.patch(`/tasks/${taskId}`, { status: newStatus });
      refreshTasks();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const filteredTasks = safeTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="task-manager-container" data-theme={theme}>
      <div className="add-task-container">
        <input type="text" name="title" placeholder="Task Title" className="task-input" value={formData.title} onChange={handleInputChange} />
        <input type="date" name="dueDate" className="task-input" value={formData.dueDate} onChange={handleInputChange} />
        <select name="priority" className="task-select" value={formData.priority} onChange={handleInputChange}>
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...filteredTasks].reverse().map((task) => (
              <tr key={task.id} onClick={() => handleView(task)} style={{ cursor: "pointer" }}>
                <td>{task.title}</td>
                <td>{task.createdAt}</td>
                <td>{task.dueDate}</td>
                <td>{task.priority}</td>
                <td>{task.status}</td>
                <td className="action-buttons">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(task); }} className="edit-btn">
                    Update
                  </button>
                  {(userRole === "admin" || userRole === "manager") && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="delete-btn">
                      Delete
                    </button>
                  )}
                </td>
                <td>
                  <div className={`custom-toggle ${task.status === "Completed" ? "completed" : "pending"}`} onClick={(e) => { e.stopPropagation(); handleToggleStatus(task.id, task.status); }}>
                    <div className="toggle-circle"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modalState.isOpen} onRequestClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))} contentLabel="Task Details" overlayClassName="modal-overlay" className="modal-content" ariaHideApp={false}>
        <button className="modal-close-btn" onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}>
          ×
        </button>
        {modalState.editMode ? (
          <div>
            <h2>Edit Task</h2>
            <input type="text" value={modalState.editedTask.title} onChange={(e) => setModalState((prev) => ({ ...prev, editedTask: { ...prev.editedTask, title: e.target.value } }))} />
            <select value={modalState.editedTask.priority} onChange={(e) => setModalState((prev) => ({ ...prev, editedTask: { ...prev.editedTask, priority: e.target.value } }))}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button onClick={handleSave} className="save-btn">
              Save Changes
            </button>
          </div>
        ) : (
          <div>
            <h2>Task Details</h2>
            {modalState.selectedTask && (
              <div>
                <p>
                  <strong>Title:</strong> {modalState.selectedTask.title}
                </p>
                <p>
                  <strong>Created On:</strong> {modalState.selectedTask.createdAt}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DueDateModel;
