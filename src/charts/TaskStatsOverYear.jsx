import React, { useContext } from "react";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
import { LanguageContext } from "../utils/LanguageContext";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const TaskStatsOverYears = ({ taskStats }) => {
  const { translate } = useContext(LanguageContext);
  const years = taskStats.map((stat) => stat.year);
  const totalTasks = taskStats.map((stat) => stat.totalTasks);
  const completedTasks = taskStats.map((stat) => stat.completedTasks);

  const data = {
    labels: years,
    datasets: [
      {
        label: translate("totalTasks"),
        data: totalTasks,
        borderColor: "#3e95cd",
        fill: false
      },
      {
        label: translate("completedTasks"),
        data: completedTasks,
        borderColor: "#8e5ea2",
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: translate("taskStatsOverYear")
      }
    }
  };

  return (
    <div className="chart-box">
      <Line data={data} options={options} />
    </div>
  );
};

export default TaskStatsOverYears;
