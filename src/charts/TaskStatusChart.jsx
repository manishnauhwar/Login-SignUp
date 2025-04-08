import React, { useContext } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { LanguageContext } from "../utils/LanguageContext";

Chart.register(ArcElement, Tooltip, Legend);

const TaskStatusChart = ({ tasks }) => {
  const { translate } = useContext(LanguageContext);

  const completed = tasks.filter((t) => t.status === "Completed" || t.status === translate("statuses.Completed")).length;
  const todo = tasks.filter((t) => t.status === "To Do" || t.status === translate("statuses.To Do")).length;
  const inProgress = tasks.filter((t) => t.status === "In progress" || t.status === translate("statuses.In progress")).length;

  const data = {
    labels: [
      translate("statuses.Completed"),
      translate("statuses.To Do"),
      translate("statuses.In progress")
    ],
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
        text: translate("taskStatusDistribution")
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
