import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const TaskStatsOverYears = ({ taskStats }) => {
  const years = taskStats.map((stat) => stat.year);
  const totalTasks = taskStats.map((stat) => stat.totalTasks);
  const completedTasks = taskStats.map((stat) => stat.completedTasks);

  const data = {
    labels: years,
    datasets: [
      {
        label: "Total Tasks",
        data: totalTasks,
        borderColor: "#3e95cd",
        fill: false
      },
      {
        label: "Completed Tasks",
        data: completedTasks,
        borderColor: "#8e5ea2",
        fill: false
      }
    ]
  };

  return (
    <div className="chart-box">
      <Line data={data} />
    </div>
  );
};

export default TaskStatsOverYears;
