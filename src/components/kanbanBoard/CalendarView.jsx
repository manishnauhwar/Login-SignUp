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
          {daysInMonth.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${tasks.some(task => task.dueDate === day.toISOString().split("T")[0]) ? "due" : ""} ${filterDate === day.toISOString().split("T")[0] ? "selected" : ""}`}
              onClick={() => setFilterDate(day.toISOString().split("T")[0])}
            >
              {day.getDate()}
            </div>
          ))}
        </div>
        {filterDate && (
          <div className="filtered-tasks">
            <h4>Tasks on {filterDate}</h4>
            {tasks.filter(task => task.dueDate === filterDate).map(task => (
              <div key={task.id} className="filtered-task-item">
                {task.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
