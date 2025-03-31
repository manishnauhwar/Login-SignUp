import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, LinearScale, CategoryScale, Tooltip, Legend);

const TaskPriorityChart = ({ tasks }) => {
  const low = tasks.filter((t) => t.priority === "Low").length;
  const medium = tasks.filter((t) => t.priority === "Medium").length;
  const high = tasks.filter((t) => t.priority === "High").length;

  const data = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        label: "Task Priority",
        data: [low, medium, high],
        backgroundColor: ["#2196F3", "#FFC107", "#F44336"],
      },
    ],
  };

  return (
    <div className="chart-box">
      <Bar data={data} />
    </div>
  );
};

export default TaskPriorityChart;
