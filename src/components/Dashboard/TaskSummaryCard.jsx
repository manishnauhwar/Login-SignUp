import React, { useContext } from "react";
// import { Doughnut } from "react-chartjs-2";
// import { Chart, ArcElement, Tooltip } from "chart.js";
import "./TaskSummaryCard.css";
import { ThemeContext } from "../../utils/ThemeContext";

// Chart.register(ArcElement, Tooltip);

const TaskSummaryCard = ({ totalTasks, overdueTasks, completedTasks, tasksForToday, TaskTodo, TaskInProgress }) => {
  const { theme } = useContext(ThemeContext);
  const pendingTasks = TaskTodo + TaskInProgress;
  // const data = {
  //   datasets: [
  //     {
  //       data: [completedTasks, totalTasks - (completedTasks + overdueTasks), overdueTasks],
  //       backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
  //     },
  //   ],
  // };
  // const options = {
  //   cutout: "70%",
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: { legend: { display: false }, tooltip: { enabled: false } },
  // };
  return (
    <div className="task-summary-card" data-theme={theme}>
      <div className="task-summary-item">
        <h3>Total Tasks</h3>
        <p>{totalTasks}</p>
      </div>
      <div className="task-summary-item overdue">
        <h3>Overdue Tasks</h3>
        <p>{overdueTasks}</p>
      </div>
      <div className="task-summary-item completed">
        <h3>Completed Tasks</h3>
        <p>{completedTasks}</p>
      </div>
      <div className="task-summary-item pending">
        <h3>Pending Tasks</h3>
        <p>{pendingTasks}</p>
      </div>
      <div className="task-summary-item task-today-chart">
        <div className="task-today">
          <h3>Tasks for Today</h3>
          <p>{tasksForToday}</p>
        </div>
        {/* <div className="doughnut-chart">
          <Doughnut data={data} options={options} />
        </div> */}
      </div>
    </div>
  );
};

export default TaskSummaryCard;
