import React, { useContext } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
import { LanguageContext } from "../utils/LanguageContext";

Chart.register(BarElement, LinearScale, CategoryScale, Tooltip, Legend);

const TaskPriorityChart = ({ tasks }) => {
  const { translate } = useContext(LanguageContext);

  const low = tasks.filter((t) => t.priority === "Low" || t.priority === translate("priorities.Low")).length;
  const medium = tasks.filter((t) => t.priority === "Medium" || t.priority === translate("priorities.Medium")).length;
  const high = tasks.filter((t) => t.priority === "High" || t.priority === translate("priorities.High")).length;

  const data = {
    labels: [
      translate("priorities.Low"),
      translate("priorities.Medium"),
      translate("priorities.High")
    ],
    datasets: [
      {
        label: translate("taskPriority"),
        data: [low, medium, high],
        backgroundColor: ["#2196F3", "#FFC107", "#F44336"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: translate("taskPriorityDistribution")
      }
    }
  };

  return (
    <div className="chart-box">
      <Bar data={data} options={options} />
    </div>
  );
};

export default TaskPriorityChart;
