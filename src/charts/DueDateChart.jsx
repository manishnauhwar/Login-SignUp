import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, LinearScale, CategoryScale, Tooltip, Legend);

const DueDateChart = ({ tasks }) => {
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
        label: "Tasks Due",
        data: values,
        backgroundColor: "#FFA500",
      },
    ],
  };

  return (
    <div className="chart-box">
      <h3>Task Due Dates</h3>
      <Bar data={data} options={{ indexAxis: "y" }} />
    </div>
  );
};

export default DueDateChart;
