import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const TasksOverTimeChart = ({ tasks }) => {
  const groupedByDate = tasks.reduce((acc, task) => {
    acc[task.dueDate] = (acc[task.dueDate] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(groupedByDate).sort();
  const values = labels.map((date) => groupedByDate[date]);

  const data = {
    labels,
    datasets: [
      {
        label: "Tasks Created Over Time",
        data: values,
        borderColor: "#3e95cd",
        fill: false,
      },
    ],
  };

  return (
    <div className="chart-box">
      <Line data={data} />
    </div>
  );
};

export default TasksOverTimeChart;
