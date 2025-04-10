import React, { useContext, useState, useEffect } from "react";
import Modal from "react-modal";
import "./DueDateModel.css";
import { ThemeContext } from "../../utils/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import { LanguageContext } from "../../utils/LanguageContext";
import ToastContainer from "../Toast/ToastContainer";
import { useTranslation } from "react-i18next";

const DueDateModel = ({ tasks = [], setTasks, searchQuery, userId, userRole }) => {
  const { theme } = useContext(ThemeContext);
  const { translate, translateTaskContent, language, translateBackendData } = useContext(LanguageContext);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Low",
    status: "To Do",
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    selectedTask: null,
    editMode: false,
    editedTask: null,
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (userRole === 'manager') {
        try {
          const response = await axiosInstance.get('/teams');
          const teams = response.data;
          const userTeam = teams.find(team => team.manager._id === userId || team.manager.id === userId);
          if (userTeam) {
            setTeamMembers(userTeam.members.map(member => member._id));
          }
        } catch (error) {
          console.error('Error fetching team members:', error);
        }
      }
    };

    fetchTeamMembers();
  }, [userId, userRole]);

  const translatedTasks = translateBackendData(tasks, {
    status: 'statuses',
    priority: 'priorities'
  });

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
      addToast(translate("errorRefreshing") || "Error refreshing tasks", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async () => {
    if (!formData.title || !formData.dueDate || !formData.description) return;

    try {
      setIsAddingTask(true);
      const taskData = {
        ...formData,
        assignedTo: userId,
      };

      console.log("Sending task data:", taskData);
      const response = await axiosInstance.post("/tasks/post", taskData);
      if (response.data) {
        console.log("Task created successfully:", response.data);
        refreshTasks();
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          priority: "Low",
          status: "To Do",
        });
        addToast(translate("taskAddedSuccessfully") || "Task added successfully", "success");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      console.error("Error details:", error.response?.data || error.message);
      addToast(translate("errorAddingTask") || "Error adding task", "error");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleView = (task) => {
    setModalState({
      isOpen: true,
      selectedTask: task,
      editMode: false,
      editedTask: null,
    });
  };

  const handleEdit = (task) => {
    setModalState({
      isOpen: true,
      selectedTask: task,
      editMode: true,
      editedTask: { ...task },
    });
  };

  const handleDelete = async (taskId) => {
    try {
      setIsDeletingTask(true);
      await axiosInstance.delete(`/tasks/${taskId}`);
      refreshTasks();
      addToast(translate("taskDeletedSuccessfully") || "Task deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting task:", error);
      let errorMessage = translate("errorDeletingTask") || "Error deleting task";

      if (error.response?.status === 403) {
        errorMessage = translate("notAuthorizedToDelete") || "You are not authorized to delete this task";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      addToast(errorMessage, "error");
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSavingTask(true);
      const taskToUpdate = { ...modalState.editedTask };

      if (taskToUpdate.originalStatus) {
        taskToUpdate.status = taskToUpdate.originalStatus;
        delete taskToUpdate.originalStatus;
      }

      if (taskToUpdate.originalPriority) {
        taskToUpdate.priority = taskToUpdate.originalPriority;
        delete taskToUpdate.originalPriority;
      }

      await axiosInstance.put(`/tasks/${taskToUpdate.id}`, taskToUpdate);
      refreshTasks();
      setModalState((prev) => ({ ...prev, isOpen: false }));
      addToast(translate("taskUpdatedSuccessfully") || "Task updated successfully", "success");
    } catch (error) {
      console.error("Error updating task:", error);
      addToast(translate("errorUpdatingTask") || "Error updating task", "error");
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleToggleStatus = async (taskId, status) => {
    try {
      let originalStatus = status;

      if (status !== "Completed" && status !== "To Do") {
        const task = translatedTasks.find(t => t.id === taskId);
        if (task && task.originalStatus) {
          originalStatus = task.originalStatus;
        }
      }

      const newStatus = originalStatus === "Completed" ? "To Do" : "Completed";
      await axiosInstance.put(`/tasks/${taskId}`, { status: newStatus });
      refreshTasks();

      const statusMessage = newStatus === "Completed"
        ? (translate("taskMarkedComplete") || "Task marked as complete")
        : (translate("taskMarkedTodo") || "Task marked as to do");

      addToast(statusMessage, "info");
    } catch (error) {
      console.error("Error toggling status:", error);
      addToast(translate("errorUpdatingStatus") || "Error updating task status", "error");
    }
  };

  const safeTasks = translatedTasks || [];
  const isDisabled = !formData.title || !formData.dueDate || !formData.description || isAddingTask;

  const filteredTasks = safeTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = [...filteredTasks].reverse().slice(indexOfFirstTask, indexOfLastTask);

  const emptyRows = [];
  const rowsToAdd = tasksPerPage - currentTasks.length;

  if (rowsToAdd > 0 && currentTasks.length > 0) {
    for (let i = 0; i < rowsToAdd; i++) {
      emptyRows.push(
        <tr key={`empty-${i}`} className="empty-row">
          <td colSpan="7">&nbsp;</td>
        </tr>
      );
    }
  }

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / tasksPerPage));

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredTasks.length, totalPages]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="task-manager-container" data-theme={theme}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="add-task-container">
        <input type="text" name="title" placeholder={translate("taskTitle")} className="task-input" value={formData.title} onChange={handleInputChange} />
        <input
          type="text"
          name="description"
          placeholder={translate("taskDescription") || "Description"}
          className="task-input"
          value={formData.description}
          onChange={handleInputChange}
        />
        <input type="date" name="dueDate" className="task-input" value={formData.dueDate} onChange={handleInputChange} />
        <select name="priority" className="task-select" value={formData.priority} onChange={handleInputChange}>
          <option value="Low">{translate("priorities.Low")}</option>
          <option value="Medium">{translate("priorities.Medium")}</option>
          <option value="High">{translate("priorities.High")}</option>
        </select>
        <button className={`task-button ${isDisabled ? "disabled" : ""}`} onClick={handleAddTask} disabled={isDisabled}>
          {isAddingTask ? (translate("adding") || "Adding...") : (translate("addTask") || "Add Task")}
        </button>
      </div>
      <div className="table-box">
        <table className="due-date-table">
          <thead>
            <tr>
              <th>{t('taskTitle')}</th>
              <th>{t('createdOn')}</th>
              <th>{t('dueDate')}</th>
              <th>{t('priority')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
              <th>{t('Complete')}</th>
            </tr>
          </thead>
          <tbody>
            {currentTasks.length > 0 ? (
              <>
                {currentTasks.map((task) => (
                  <tr key={task.id} onClick={() => handleView(task)} style={{ cursor: "pointer" }}>
                    <td>{task.title}</td>
                    <td>{task.createdAt}</td>
                    <td>{task.dueDate}</td>
                    <td>{task.priority}</td>
                    <td>{task.status}</td>
                    <td className="action-buttons">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(task); }} className="edit-btn">
                        {t('update')}
                      </button>
                      {(userRole === "admin" || userRole === "manager" || task.userId === userId) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isDeletingTask) handleDelete(task.id);
                          }}
                          className="delete-btn"
                          disabled={isDeletingTask}
                        >
                          {isDeletingTask ? t('deleting') || 'Deleting...' : t('delete') || 'Delete'}
                        </button>
                      )}
                    </td>
                    <td>
                      <div className={`custom-toggle ${task.status === translate("statuses.Completed") || task.status === "Completed" ? "completed" : "pending"}`} onClick={(e) => { e.stopPropagation(); handleToggleStatus(task.id, task.status); }}>
                        <div className="toggle-circle"></div>
                      </div>
                    </td>
                  </tr>
                ))}
                {emptyRows}
              </>
            ) : (
              <tr className="no-tasks-row">
                <td colSpan="7" className="no-tasks-message">{t('noTasksAvailable') || 'No tasks available'}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination-container">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            {t('previous') || 'Previous'}
          </button>
          <div className="pagination-info">
            {t('page') || 'Page'} {currentPage} {t('of') || 'of'} {totalPages}
            {filteredTasks.length > 0 && ` (${filteredTasks.length} ${t('tasks') || 'tasks'})`}
          </div>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="pagination-button"
          >
            {t('next') || 'Next'}
          </button>
        </div>
      </div>

      <Modal isOpen={modalState.isOpen} onRequestClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))} contentLabel="Task Details" overlayClassName="modal-overlay" className="modal-content" ariaHideApp={false}>
        <button className="modal-close-btn" onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}>
          ×
        </button>
        <div className="due-date-modal-content">
          {modalState.editMode ? (
            <div>
              <h2>{t('editTask')}</h2>
              <input type="text" value={modalState.editedTask.title} onChange={(e) => setModalState((prev) => ({ ...prev, editedTask: { ...prev.editedTask, title: e.target.value } }))} />
              <select value={modalState.editedTask.priority} onChange={(e) => setModalState((prev) => ({ ...prev, editedTask: { ...prev.editedTask, priority: e.target.value } }))}>
                <option value="Low">{t('priorities.Low')}</option>
                <option value="Medium">{t('priorities.Medium')}</option>
                <option value="High">{t('priorities.High')}</option>
              </select>
              <select value={modalState.editedTask.status} onChange={(e) => setModalState((prev) => ({ ...prev, editedTask: { ...prev.editedTask, status: e.target.value } }))}>
                <option value="To Do">{t('statuses.To Do')}</option>
                <option value="In progress">{t('statuses.In progress')}</option>
                <option value="Completed">{t('statuses.Completed')}</option>
              </select>
              <textarea
                className="task-description-input"
                placeholder={t('taskDescription')}
                value={modalState.editedTask.description}
                onChange={(e) => setModalState((prev) => ({ ...prev, editedTask: { ...prev.editedTask, description: e.target.value } }))}
              />
              <input type="date" value={modalState.editedTask.dueDate} onChange={(e) => setModalState((prev) => ({ ...prev, editedTask: { ...prev.editedTask, dueDate: e.target.value } }))} />
              <button onClick={handleSave} className="save-btn" disabled={isSavingTask}>
                {isSavingTask ? (t('saving') || 'Saving...') : (t('saveChanges') || 'Save Changes')}
              </button>
            </div>
          ) : (
            <div>
              <h2>{t('taskDetails')}</h2>
              {modalState.selectedTask && (
                <div>
                  <p>
                    <strong>{t('title')}:</strong> {modalState.selectedTask.title}
                  </p>
                  <p>
                    <strong>{t('taskDescription')}:</strong> {modalState.selectedTask.description}
                  </p>
                  <p>
                    <strong>{t('createdOn')}:</strong> {modalState.selectedTask.createdAt}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DueDateModel;
