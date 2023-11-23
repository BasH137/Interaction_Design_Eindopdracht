let baseUrl = "https://localhost:7284";
let data = [];
let continentData = [];
let chartInstance;

async function fetchData() {
  try {
    const response = await fetch(`${baseUrl}/api/Iq/money-divided-by-1000`);
    const result = await response.json();
    data = result.map(entry => ({
      country: entry.country,
      iq: entry.iq,
      educationExpenditure: entry.educationExpenditure,
      avgIncome: entry.avgIncome,
      continent: entry.continent
    }));
    populateContinentList();
    populateCountryList();
    createBarChart();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
let continentFilterButton = document.querySelector(".js-button-filter-continent");
continentFilterButton.addEventListener("click", redrawChart);

// Add a new event listener for removing continent filter button
let continentRemoveFilterButton = document.querySelector(".js-button-filter-continent-remove");
continentRemoveFilterButton.addEventListener("click", () => {
  $("#continentSelect").val(null).trigger("change");
  redrawChart();
});



function populateCountryList() {
  const selectedContinents = $("#continentSelect").val();
  const select = $("#countrySelect");
  select.empty(); // Clear previous options

  if (selectedContinents && selectedContinents.length > 0) {
    const filteredCountries = data.filter(entry => selectedContinents.includes(entry.continent));

    filteredCountries.forEach((entry) => {
      const option = new Option(entry.country, entry.country);
      select.append(option);
    });
  } else {
    // No continents selected, append all countries
    data.forEach((entry) => {
      const option = new Option(entry.country, entry.country);
      select.append(option);
    });
  }

  // Initialize Select2
  select.select2();
}


function populateContinentList() {
  const select = $("#continentSelect");

  // Extract unique continents from the data
  const uniqueContinents = [...new Set(data.map(entry => entry.continent))];

  uniqueContinents.forEach((continent) => {
    const option = new Option(continent, continent);
    select.append(option);
  });

  // Initialize Select2
  select.select2();

  // Add event listener to continent select
  select.on('change', function () {
    populateCountryList();
  });

  // Trigger change to populate initial country list
  select.val("Europe").trigger("change");
}


// Add a new event listener for continent filter button

function redrawChart() {
  const selectedCountries = $("#countrySelect").val();
  const selectedContinent = $("#continentSelect").val();

  console.log(selectedCountries);
  console.log(selectedContinent);

  // Call the createBarChart function with selected countries and continent
  createBarChart(selectedCountries, selectedContinent);
}

// Modify the createBarChart function to accept a selected continent parameter
function createBarChart(selectedCountries = [], selectedContinent = []) {
  const canvas = document.getElementById("myBarChart");
  const ctx = canvas.getContext("2d");

  const filteredData = data.filter((entry) =>
    (selectedCountries.length > 0 ? selectedCountries.includes(entry.country) : true) &&
    (selectedContinent.length > 0 ? selectedContinent.includes(entry.continent) : true)
  );

  const countries = filteredData.map((entry) => entry.country);
  const iqData = filteredData.map((entry) => entry.iq);
  const expenditureData = filteredData.map((entry) => entry.educationExpenditure);
  const incomeData = filteredData.map((entry) => entry.avgIncome);

  const isMobile = window.innerWidth <= 600;

  if (isMobile) {
    canvas.style = "height: 100vh";
  } else {
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

document.addEventListener("DOMContentLoaded", function () {
  // Call the fetchData function
  fetchData();

  // Call the function to create the bar chart
  createBarChart();

  // Add event listener for country filter button
  let countryFilterButton = document.querySelector(".js-button-filter-country");
  countryFilterButton.addEventListener("click", redrawChart);

  // Add event listener for removing country filter button
  let countryRemoveFilterButton = document.querySelector(".js-button-filter-country-remove");
  countryRemoveFilterButton.addEventListener("click", () => {
    $("#countrySelect").val(null).trigger("change");
    redrawChart();
  });
});
