let baseUrl = "https://localhost:7284";
let data = [];
let chartInstance;

async function fetchData() {
  try {
    const response = await fetch(`${baseUrl}/api/Iq/money-divided-by-1000`);
    data = await response.json();
    console.log(data);
    populateCountryList();
    createBarChart();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function populateCountryList() {
  const select = $("#countrySelect");

  data.forEach((entry) => {
    const option = new Option(entry.country, entry.country);
    select.append(option);
  });

  // Initialize Select2
  select.select2();
}

// Function to create or update the bar chart
function createBarChart(selectedCountries = []) {
  const canvas = document.getElementById("myBarChart");
  const ctx = canvas.getContext("2d");

  const filteredData = data.filter((entry) =>
    selectedCountries.length > 0
      ? selectedCountries.includes(entry.country)
      : true
  );

  const countries = filteredData.map((entry) => entry.country);
  const iqData = filteredData.map((entry) => entry.iq);
  const expenditureData = filteredData.map(
    (entry) => entry.educationExpenditure
  );
  const incomeData = filteredData.map((entry) => entry.avgIncome);

  const isMobile = window.innerWidth <= 600;
 
  if(isMobile){
    canvas.style = "height: 100vh";
  }
  else{
    canvas.style = "height: 37.5rem";
  }

  // Destroy the existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create the new chart
  chartInstance = new Chart(ctx, {
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
          label: "Education Expenditure (per capita in thousands $)",
          data: expenditureData,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Average Income (Thousands $)",
          data: incomeData,
          backgroundColor: "rgba(255, 205, 86, 0.2)",
          borderColor: "rgba(255, 205, 86, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      // responsive: true,
      plugins: {
        legend: {
            display: true,
            position: 'top',
            align: 'start',
            textDirection: 'ltr',
            labels: {
                color: 'rgb(255, 99, 132)'
            }
        }
    },
      maintainAspectRatio: false,
      indexAxis: isMobile ? "y" : "x",
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
      
    },
});

}

function redrawChart() {
  const selectedCountries = $("#countrySelect").val();

  console.log(selectedCountries);

// Call the createBarChart function with selected countries
createBarChart(selectedCountries);
}

// Call the function to create the bar chart
window.addEventListener("resize", () => {
  const selectedCountries = $("#countrySelect").val();

  redrawChart(selectedCountries);
});

document.addEventListener("DOMContentLoaded", function () {
  // Call the fetchData function
  fetchData();

  let button = document.querySelector(".js-button-filter");
  button.addEventListener("click", redrawChart);
});