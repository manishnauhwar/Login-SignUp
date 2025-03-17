import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const TaskStatusChart = ({ tasks }) => {
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const overdue = tasks.filter((t) => t.status === "Overdue").length;

  const data = {
    labels: ["Completed", "Pending", "Overdue"],
    datasets: [
      {
        data: [completed, pending, overdue],
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="chart-box">
      <Doughnut data={data} />
    </div>
  );
};

export default TaskStatusChart;
