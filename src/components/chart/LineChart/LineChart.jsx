import { useEffect, useState } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

const LineChart = ({ usersReport, subscriptionReport }) => {
  const [activeButton, setActiveButton] = useState({
    title: "Users",
    color: "emerald",
  });
  let [data, setData] = useState(usersReport);
  useEffect(() => {
    setData(usersReport);
  }, [usersReport]);
  console.log(data);
  const handleClick = ({ title, color }) => {
    setActiveButton({ title, color });
    if (title === "Users") {
      setData(usersReport);
    } else {
      setData(subscriptionReport);
    }
  };
  const barOptions = {
    data: {
      labels: data
        ?.sort((a, b) => new Date(a._id) - new Date(b._id))
        ?.map((or) => or._id),
      datasets: [
        {
          label: "Users",
          data: data
            ?.sort((a, b) => new Date(a._id) - new Date(b._id))
            ?.map((or) => or.count),
          borderColor: "#10B981",
          backgroundColor: "#10B981",
          borderWidth: 3,
          yAxisID: "y",
        },
        {
          label: "Subscriptions",
          data: subscriptionReport
            ?.sort((a, b) => new Date(a._id) - new Date(b._id))
            ?.map((or) => or.count),
          borderColor: "#F97316",
          backgroundColor: "#F97316",
          borderWidth: 3,
          yAxisID: "y",
        },
      ],
    },
    options: {
      responsive: true,
    },
    legend: {
      display: false,
    },
  };

  const { t } = useTranslation();

  return (
    <>

      <Line {...barOptions} />
    </>
  );
};

export default LineChart;
