let baseUrl = "https://localhost:7284";
let data = [];
let continentData = [];
let chartInstance;
let chartType = "bar";

async function fetchData() {
  try {
    // const response = await fetch(`${baseUrl}/api/Iq/money-divided-by-1000`);
    const response = await fetch("./data/UpdatedData.json");
    const result = await response.json();
    data = result.map((entry) => ({
      country: entry.country,
      iq: entry.iq,
      educationExpenditure: entry.educationExpenditure,
      avgIncome: entry.avgIncome,
      continent: entry.continent,
      avgTemp: entry.avgTemp,
    }));
    populateContinentList();
    populateCountryList();
    redrawChart();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function populateCountryList() {
  const selectedContinents = $("#continentSelect").val();
  const selectedCountries = $("#countrySelect").val();
  const select = $("#countrySelect");

  let selectedCountriesToKeep;
  
  if (selectedContinents.length > 0) {
    selectedCountriesToKeep = data.filter((entry) =>
      selectedContinents.includes(entry.continent) && selectedCountries.includes(entry.country)
    );
  } else {
    selectedCountriesToKeep = data.filter((entry) =>
      selectedCountries.includes(entry.country)
    );
  }

  const countriesToKeep = selectedContinents.length > 0
    ? data.filter((entry) => selectedContinents.includes(entry.continent))
    : data;

  // Remove options that are not in countriesToKeep
  select.find("option").each(function () {
    const country = $(this).val();
    if (!countriesToKeep.some((entry) => entry.country === country)) {
      $(this).remove();
    }
  });

  if (countriesToKeep.length > 0) {
    countriesToKeep.forEach((entry) => {
      const option = new Option(entry.country, entry.country);
      // Append only if the option doesn't exist
      if (!select.find(`option[value="${entry.country}"]`).length) {
        select.append(option);
      }
    });
  } else {
    // No continents selected or no matching countries, append all countries
    data.forEach((entry) => {
      const option = new Option(entry.country, entry.country);
      // Append only if the option doesn't exist
      if (!select.find(`option[value="${entry.country}"]`).length) {
        select.append(option);
      }
    });
  }

  // Initialize Select2
  select.select2();
  sortSelect(select[0]);

  // Extract an array of country values from selectedCountriesToKeep
  const countryValues = selectedCountriesToKeep.map(entry => entry.country);

  // Set default values for the country selection
  select.val(countryValues).trigger("change");
}


function populateContinentList() {
  const select = $("#continentSelect");

  // Extract unique continents from the data
  const uniqueContinents = [...new Set(data.map((entry) => entry.continent))];

  uniqueContinents.forEach((continent) => {
    const option = new Option(continent, continent);
    select.append(option);
  });

  // Initialize Select2
  select.select2();

  // Add event listener to continent select
  select.on("change", function () {
    populateCountryList();
  });

  // Trigger change to populate initial country list
  sortSelect(select[0]);
  // select.val("Europe").trigger("change");
}

function sortSelect(selElem) {
  var tmpAry = new Array();
  for (var i = 0; i < selElem.options.length; i++) {
    tmpAry[i] = new Array();
    tmpAry[i][0] = selElem.options[i].text;
    tmpAry[i][1] = selElem.options[i].value;
  }
  tmpAry.sort();
  while (selElem.options.length > 0) {
    selElem.options[0] = null;
  }
  for (var i = 0; i < tmpAry.length; i++) {
    var op = new Option(tmpAry[i][0], tmpAry[i][1]);
    selElem.options[i] = op;
  }
  return;
}

// Add a new event listener for continent filter button

function redrawChart() {
  const selectedCountries = $("#countrySelect").val();
  const selectedContinent = $("#continentSelect").val();

  console.log(selectedCountries);
  console.log(selectedContinent);

  // Call the createChart function with selected countries and continent
  createChart(selectedCountries, selectedContinent);
}
// Colors for each dataset
const iqColor = "rgba(75, 192, 192, 0.2)";
const iqBorderColor = "rgba(75, 192, 192, 1)";

const expenditureColor = "rgba(255, 99, 132, 0.2)";
const expenditureBorderColor = "rgba(255, 99, 132, 1)";

const incomeColor = "rgba(255, 205, 86, 0.2)";
const incomeBorderColor = "rgba(255, 205, 86, 1)";

const temperatureColor = "rgba(169, 169, 169, 0.2)";
const temperatureBorderColor = "rgba(169, 169, 169, 1)";

const scatterColor = "rgba(255, 0, 0, 1)"; // Customize the scatter plot color

function createChart(selectedCountries = [], selectedContinent = []) {
  const canvas = document.getElementById("myChart");
  const ctx = canvas.getContext("2d");

  const filteredData = data.filter(
    (entry) =>
      (selectedCountries.length > 0
        ? selectedCountries.includes(entry.country)
        : true) &&
      (selectedContinent.length > 0
        ? selectedContinent.includes(entry.continent)
        : true)
  );

  const countries = filteredData.map((entry) => entry.country);
  const iqData = filteredData.map((entry) => entry.iq);
  const expenditureData = filteredData.map(
    (entry) => entry.educationExpenditure
  );
  const incomeData = filteredData.map((entry) => entry.avgIncome);
  const temperatureData = filteredData.map((entry) => entry.avgTemp);

  const isMobile = window.outerWidth <= 600;

  if (isMobile && chartType === "bar") {
    canvas.style = "height: 100vh";
  } else {
    canvas.style = "height: 37.5rem";
  }

  // Destroy the existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (chartType === "bar") {
    chartInstance = createBarChart(
      ctx,
      countries,
      iqData,
      expenditureData,
      incomeData,
      temperatureData,
      isMobile
    );
  } else if (chartType === "scatter1") {
    createScatterPlot1(ctx, temperatureData, iqData, isMobile);
  } else if (chartType === "scatter2") {
    createScatterPlot2(ctx, expenditureData, iqData, isMobile);
  } else if (chartType === "scatter3") {
    createScatterPlot3(ctx, expenditureData, incomeData, isMobile);
  }
}

// Create the bar chart
function createBarChart(
  ctx,
  countries,
  iqData,
  expenditureData,
  incomeData,
  temperatureData,
  isMobile
) {
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: countries,
      datasets: [
        {
          label: "Average IQ",
          type: "bar",
          data: iqData,
          backgroundColor: iqColor,
          borderColor: iqBorderColor,
          borderWidth: 1,
          yAxisID: "y",
        },
        {
          label: "Education Expenditure (per capita in thousands $)",
          type: "bar",
          data: expenditureData,
          backgroundColor: expenditureColor,
          borderColor: expenditureBorderColor,
          borderWidth: 1,
          yAxisID: "y",
        },
        {
          label: "Average Income (Thousands $)",
          type: "bar",
          data: incomeData,
          backgroundColor: incomeColor,
          borderColor: incomeBorderColor,
          borderWidth: 1,
        },
        {
          label: "Temperature in Celsius",
          type: "bar",
          data: temperatureData,
          backgroundColor: temperatureColor,
          borderColor: temperatureBorderColor,
          borderWidth: 1,
          hidden: true,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true,
          position: "top",
          align: "center",
          textDirection: "ltr",
          labels: {
            color: "rgb(255, 99, 132)",
          },
        },
      },
      maintainAspectRatio: false,
      // indexAxis: isMobile ? "y" : "x",
      indexAxis: isMobile ? "y" : "x",
      scales: {
        x: {
          beginAtZero: true,
          position: isMobile ? "top" : "bottom",
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}


// Helper functions to create scatter plots
// Scatter Plot 1: Temperature vs IQ
function createScatterPlot1(ctx, xData, yData, isMobile) {
  // Filter out 0 values
  const filteredData = xData.reduce(
    (result, value, index) => {
      if (value !== 0 && yData[index] !== 0) {
        result.x.push(value);
        result.y.push(yData[index]);
      }
      return result;
    },
    { x: [], y: [] }
  );

  chartInstance = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Temperature vs IQ",
          data: filteredData.x.map((value, index) => ({
            x: value,
            y: filteredData.y[index],
          })),
          backgroundColor: scatterColor,
          pointRadius: 6,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          position: isMobile ? "top" : "bottom",
          title: {
            display: true,
            text: "average temperature (°C)",
          },
        },
        y: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "IQ",
          },
        },
      },
    },
  });
}

// Scatter Plot 2: Education Expenditure vs IQ
function createScatterPlot2(ctx, xData, yData, isMobile) {
  // Filter out 0 values
  const filteredData = xData.reduce(
    (result, value, index) => {
      if (value !== 0 && yData[index] !== 0) {
        result.x.push(value);
        result.y.push(yData[index]);
      }
      return result;
    },
    { x: [], y: [] }
  );

  chartInstance = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Education Expenditure vs IQ",
          data: filteredData.x.map((value, index) => ({
            x: value,
            y: filteredData.y[index],
          })),
          backgroundColor: scatterColor,
          pointRadius: 6,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          position: isMobile ? "top" : "bottom",
          title: {
            display: true,
            text: "Education Expenditure (per capita in thousands $)",
          },
        },
        y: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "IQ",
          },
        },
      },
    },
  });
}

// Scatter Plot 3: Education Expenditure vs Average Income
function createScatterPlot3(ctx, xData, yData, isMobile) {
  // Filter out 0 values
  const filteredData = xData.reduce(
    (result, value, index) => {
      if (value !== 0 && yData[index] !== 0) {
        result.x.push(value);
        result.y.push(yData[index]);
      }
      return result;
    },
    { x: [], y: [] }
  );

  chartInstance = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Education Expenditure vs Average Income",
          data: filteredData.x.map((value, index) => ({
            x: value,
            y: filteredData.y[index],
          })),
          backgroundColor: scatterColor,
          pointRadius: 6,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          position: isMobile ? "top" : "bottom",
          title: {
            display: true,
            text: "Education Expenditure (per capita in thousands $)",
          },
        },
        y: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: "Average Income (Thousands $)",
          },
        },
      },
    },
  });
}

// Modify the redrawChart function to pass the selected chart type
function redrawChart() {
  const selectedCountries = $("#countrySelect").val();
  const selectedContinent = $("#continentSelect").val();

  console.log(selectedCountries);
  console.log(selectedContinent);

  // Call the createChart function with selected countries, continent, and chart type
  createChart(selectedCountries, selectedContinent);
}

$(document).ready(function () {
  const isMobile = window.outerWidth <= 600;
  const resizeEvent = isMobile ? "orientationchange" : "resize";

  redrawChart(); //this is needed to fix the bug where media query is not working even tho fetch data calls redrawChart

  $(window).on(resizeEvent, redrawChart);

  $('input[name="chartType"]').on("change", function () {
    chartType = $('input[name="chartType"]:checked').val();
    redrawChart();
  });

  // Add event listener for removing country filter button
  let countryRemoveFilterButton = $(".js-button-filter-country-remove");

  countryRemoveFilterButton.on("click", function () {
    $("#countrySelect").val(null).trigger("change");
    redrawChart();
  });

  $("#countrySelect").on("change", function () {
    redrawChart();
  });

  // Add a new event listener for removing continent filter button
  let continentRemoveFilterButton = $(".js-button-filter-continent-remove");

  continentRemoveFilterButton.on("click", function () {
    $("#continentSelect").val(null).trigger("change");
    redrawChart();
  });

  $("#continentSelect").on("change", function () {
    redrawChart();
  });

  // Call the fetchData function
  fetchData();
});