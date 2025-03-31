import React, { useState, useContext } from "react";
import { ThemeContext } from "../../utils/ThemeContext";
import "./CalendarView.css";

const CalendarView = ({ tasks, setFilterDate, filterDate, onClose }) => {
  const { theme } = useContext(ThemeContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = [];
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    daysInMonth.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const formatDateForComparison = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const parseTaskDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return formatDateForComparison(date);
    } catch {
      return null;
    }
  };

  const hasTasksOnDate = (date) => {
    const formattedDate = formatDateForComparison(date);
    return tasks.some(task => parseTaskDate(task.createdAt) === formattedDate);
  };

  const getTasksForDate = (date) => {
    const formattedDate = formatDateForComparison(date);
    return tasks.filter(task => parseTaskDate(task.createdAt) === formattedDate);
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="calendar-overlay" data-theme={theme}>
      <div className="calendar-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="calendar-header">
          <button onClick={goToPrevMonth}>{"<"}</button>
          <h3>{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</h3>
          <button onClick={goToNextMonth}>{">"}</button>
        </div>
        <div className="calendar-grid">
          {daysInMonth.map((day, index) => {
            const formattedDay = formatDateForComparison(day);
            const hasTasks = hasTasksOnDate(day);
            return (
              <div
                key={index}
                className={`calendar-day ${hasTasks ? "due" : ""} ${filterDate === formattedDay ? "selected" : ""}`}
                onClick={() => setFilterDate(formattedDay)}
              >
                {day.getDate()}
                {hasTasks && <span className="task-dot"></span>}
              </div>
            );
          })}
        </div>
        {filterDate && (
          <div className="filtered-tasks">
            <h4>Tasks on {filterDate}</h4>
            {getTasksForDate(new Date(filterDate.split('-').reverse().join('-'))).map(task => (
              <div key={task._id} className="filtered-task-item">
                <div className="task-title">{task.title}</div>
                <div className="task-priority" style={{ ...getPriorityStyle(task.priority) }}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high": return { backgroundColor: "#ff6b6b", color: "white" };
    case "medium": return { backgroundColor: "#ffb74d", color: "white" };
    case "low": return { backgroundColor: "#4caf50", color: "white" };
    default: return { backgroundColor: "#ddd", color: "black" };
  }
};

export default CalendarView;
