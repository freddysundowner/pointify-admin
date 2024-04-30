import "chart.js/auto";
import { Pie } from "react-chartjs-2";

const PieChart = ({ data }) => {
  const PieOption = {
    data: {
      datasets: [
        {
          data: data?.counts?.map((selling) => selling.count),
          backgroundColor: ["#10B981", "#3B82F6"],
          label: "Subscriptions",
        },
      ],
      labels: data?.lables?.map((selling) => selling.label),
    },
    options: {
      responsive: true,
      cutoutPercentage: 80,
    },
    legend: {
      display: false,
    },
  };

  return (
    <div>
      <Pie {...PieOption} className="chart" />
    </div>
  );
};

export default PieChart;
