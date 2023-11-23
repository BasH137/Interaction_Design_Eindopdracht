let baseUrl = "https://localhost:7284";
let data = [];

async function fetchData() {
  try {
    // const response = await fetch(`${baseUrl}/api/Iq`);
    const response = await fetch(`${baseUrl}/api/Iq/money-divided-by-1000`);
    data = await response.json();
    console.log(data);
    createBarChart();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Function to create the bar chart
function createBarChart() {
  const ctx = document.getElementById("myBarChart").getContext("2d");

  const countries = data.map((entry) => entry.country);
  const iqData = data.map((entry) => entry.iq);
  const expenditureData = data.map((entry) => entry.educationExpenditure);
  const incomeData = data.map((entry) => entry.avgIncome);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: countries,
      datasets: [
        {
          label: "Average IQ",
          data: iqData,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Education Expenditure (per capita in thouseands $)",
          data: expenditureData,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Average Income (Thouseands $)",
          data: incomeData,
          backgroundColor: "rgba(255, 205, 86, 0.2)",
          borderColor: "rgba(255, 205, 86, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function redrawChartOnResize() {
  // Remove any existing chart
  const existingChart = Chart.getChart('myBarChart');
  if (existingChart) {
    existingChart.destroy();
  }

  // Create the chart again
  createBarChart();
}

// Call the function to create the bar chart
window.addEventListener('resize', redrawChartOnResize);

document.addEventListener("DOMContentLoaded", function () {
  // Function to fetch data from the API
  fetchData();
});
