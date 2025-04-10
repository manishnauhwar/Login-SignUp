import React, { useContext } from "react";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
import { LanguageContext } from "../utils/LanguageContext";

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const TaskCompletionTrend = ({ tasks }) => {
  const { translate } = useContext(LanguageContext);

  const processTaskData = () => {
    const monthlyData = {};

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyData[monthKey] = 0;
    }

    tasks.forEach(task => {
      if (task.status && task.status.toLowerCase() === "completed") {
        const completionDate = task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt);
        const monthKey = `${completionDate.getFullYear()}-${(completionDate.getMonth() + 1).toString().padStart(2, '0')}`;

        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey]++;
        }
      }
    });

    return monthlyData;
  };

  const monthlyData = processTaskData();

  const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'short' });
  };

  const data = {
    labels: Object.keys(monthlyData).map(formatMonthLabel),
    datasets: [
      {
        label: translate("completedTasks"),
        data: Object.values(monthlyData),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#4CAF50",
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: translate("taskCompletionTrend"),
        font: {
          size: 16
        }
      },
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItems) {
            const date = new Date(
              new Date().getFullYear(),
              Object.keys(monthlyData).findIndex(key => formatMonthLabel(key) === tooltipItems[0].label),
              1
            );
            return date.toLocaleString('default', { month: 'long', year: 'numeric' });
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: translate("numberOfTasks")
        },
        ticks: {
          precision: 0 
        }
      },
      x: {
        title: {
          display: true,
          text: translate("month")
        }
      }
    }
  };

  return (
    <div className="chart-box">
      <Line data={data} options={options} />
    </div>
  );
};

export default TaskCompletionTrend;
