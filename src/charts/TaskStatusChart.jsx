import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const TaskStatusChart = ({ tasks }) => {
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const todo = tasks.filter((t) => t.status === "To Do").length;
  const inProgress = tasks.filter((t) => t.status === "In progress").length;

  const data = {
    labels: ["Completed", "To Do", "In Progress"],
    datasets: [
      {
        data: [completed, todo, inProgress],
        backgroundColor: ["#4CAF50", "#FFC107", "#2196F3"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Task Status Distribution'
      }
    }
  };

  return (
    <div className="chart-box">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default TaskStatusChart;
