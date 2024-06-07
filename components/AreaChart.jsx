import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Total Services',
      data: [45, 50, 60, 70, 80, 90, 100],
      fill: true,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      tension: 0.4,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Area Chart Example',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const AreaChart = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="w-full max-w-2xl">
      <Line data={data} options={options} />
    </div>
  </div>
);

export default AreaChart;
