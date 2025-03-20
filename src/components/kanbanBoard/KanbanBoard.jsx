import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Main from "../Title/Main";
import { logout } from "../../utils/auth";
import { useDrop } from "react-dnd";
import TaskCards from "./TaskCards";
import CalendarView from "./CalendarView";
import { ThemeContext } from "../../utils/ThemeContext";
import "./KanbanBoard.css";

const KanbanBoard = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "pending",
    createdAt: new Date().toISOString().split("T")[0],
    assignedTo: "",
    completionTime: "",
    timeElapsed: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState("kanban");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/tasks");
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const moveTask = async (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    try {
      await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const addTask = async () => {
    if (!newTaskData.title.trim() || !newTaskData.dueDate.trim()) return;
    const taskData = {
      ...newTaskData,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0]
    };
    try {
      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
      setTasks((prev) => [...prev, taskData]);
      setShowModal(false);
      setNewTaskData({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        status: "pending",
        createdAt: new Date().toISOString().split("T")[0],
        assignedTo: "",
        completionTime: "",
        timeElapsed: 0
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const Column = ({ title, statusFilter }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: "TASK",
      drop: (item) => moveTask(item.id, statusFilter),
      collect: (monitor) => ({ isOver: !!monitor.isOver() }),
    }));
    return (
      <div className="column" ref={drop} style={{ background: isOver ? "#f0f0f0" : "white" }}>
        <h3>{title}</h3>
        {tasks
          .filter((task) => task.status.toLowerCase() === statusFilter.toLowerCase())
          .map((task) => (
            <TaskCards key={task.id} task={task} />
          ))}
      </div>
    );
  };

  return (
    <div className="home-container" data-theme={theme}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`} data-theme={theme}>
        <Navbar handleLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
        <Main />
        <div className="view-toggle">
          <button onClick={() => setView("kanban")}>Kanban</button>
          <button onClick={() => setView("calendar")}>Calendar</button>
        </div>
        {view === "kanban" && (
          <>
            <button className="add-task-btn" onClick={() => setShowModal(true)}>+ Add Task</button>
            <div className="boardContainer">
              <Column title="To Do" statusFilter="pending" />
              <Column title="In Progress" statusFilter="in progress" />
              <Column title="Done" statusFilter="completed" />
            </div>
          </>
        )}
        {view === "calendar" && (
          <CalendarView tasks={tasks} setFilterDate={setFilterDate} filterDate={filterDate} onClose={() => setView("kanban")} />
        )}
        {showModal && (
          <div className="modal">
            <input type="text" placeholder="Title" value={newTaskData.title} onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })} />
            <textarea placeholder="Description" value={newTaskData.description} onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}></textarea>
            <input type="date" value={newTaskData.dueDate} onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })} />
            <select value={newTaskData.priority} onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button onClick={addTask}>Add Task</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
