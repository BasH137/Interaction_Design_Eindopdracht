let baseUrl = "https://localhost:7284";
let data = [];
let continentData = [];
let chartInstances = {};
let chartType = "bar";
// Colors for each dataset
const scatterColor = "rgba(255, 0, 0, 1)";
const iqColor = "rgba(75, 192, 192, 0.2)";
const iqBorderColor = "rgba(75, 192, 192, 1)";
const expenditureColor = "rgba(255, 99, 132, 0.2)";
const expenditureBorderColor = "rgba(255, 99, 132, 1)";
const incomeColor = "rgba(255, 205, 86, 0.2)";
const incomeBorderColor = "rgba(255, 205, 86, 1)";
const temperatureColor = "rgba(169, 169, 169, 0.2)";
const temperatureBorderColor = "rgba(169, 169, 169, 1)";

async function fetchData() {
  try {
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
    drawCharts(); // Draw all charts after fetching data
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
    selectedCountriesToKeep = data.filter(
      (entry) =>
        selectedContinents.includes(entry.continent) &&
        selectedCountries.includes(entry.country)
    );
  } else {
    selectedCountriesToKeep = data.filter((entry) =>
      selectedCountries.includes(entry.country)
    );
  }

  const countriesToKeep =
    selectedContinents.length > 0
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
  const countryValues = selectedCountriesToKeep.map((entry) => entry.country);

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
function drawCharts() {
  const scatterTempIqCanvas = document.getElementById("myScatterTempIq");
  const scatterEdIqCanvas = document.getElementById("myScatterEdIq");
  const scatterEdINCanvas = document.getElementById("myScatterEdIN");
  const barChartCanvas = document.getElementById("myBarChart");

  // Destroy existing chart instances before creating new ones
  if (chartInstances.myScatterTempIq) {
    chartInstances.myScatterTempIq.destroy();
  }
  if (chartInstances.myScatterEdIq) {
    chartInstances.myScatterEdIq.destroy();
  }
  if (chartInstances.myScatterEdIN) {
    chartInstances.myScatterEdIN.destroy();
  }
  if (chartInstances.myBarChart) {
    chartInstances.myBarChart.destroy();
  }

  if (
    scatterTempIqCanvas &&
    scatterEdIqCanvas &&
    scatterEdINCanvas &&
    barChartCanvas
  ) {
    const scatterTempIqCtx = scatterTempIqCanvas.getContext("2d");
    const scatterEdIqCtx = scatterEdIqCanvas.getContext("2d");
    const scatterEdINCtx = scatterEdINCanvas.getContext("2d");
    const barChartCtx = barChartCanvas.getContext("2d");

    // Draw scatter plots
    chartInstances.myScatterTempIq = createScatterPlot(
      scatterTempIqCtx,
      data.map((entry) => entry.avgTemp),
      data.map((entry) => entry.iq),
      scatterColor,
      "Temperature vs IQ",
      "average temperature (°C)",
      "IQ",
      false
    );

    chartInstances.myScatterEdIq = createScatterPlot(
      scatterEdIqCtx,
      data.map((entry) => entry.educationExpenditure),
      data.map((entry) => entry.iq),
      scatterColor,
      "Education Expenditure vs IQ",
      "Education Expenditure (per capita in thousands $)",
      "IQ",
      false
    );

    chartInstances.myScatterEdIN = createScatterPlot(
      scatterEdINCtx,
      data.map((entry) => entry.educationExpenditure),
      data.map((entry) => entry.avgIncome),
      scatterColor,
      "Education Expenditure vs Average Income",
      "Education Expenditure (per capita in thousands $)",
      "Average Income (Thousands $)",
      false
    );
    // Draw bar chart
    chartInstances.myBarChart = createBarChart(
      barChartCtx,
      data.map((entry) => entry.country),
      data.map((entry) => entry.iq),
      data.map((entry) => entry.educationExpenditure),
      data.map((entry) => entry.avgIncome),
      data.map((entry) => entry.avgTemp),
      false
    );
  }
}

// Function to create scatter plotfunction 
function createScatterPlot(ctx, xData, yData, color, label, xLabel, yLabel, isMobile) {
  return new Chart(ctx, {
    type: "scatter",
    data: {
      labels: xData,
      datasets: [
        {
          label: label,
          data: xData.map((_, index) => ({ x: xData[index], y: yData[index] })),
          backgroundColor: color,
          borderColor: color,
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
      scales: {
        x: {
          type: "linear",
          position: isMobile ? "top" : "bottom",
          title: {
            display: true,
            text: xLabel, // Add your X-Axis label here
            color: "black",
          },
        },
        y: {
          type: "linear",
          position: "left",
          title: {
            display: true,
            text: yLabel, // Add your Y-Axis label here
            color: "black",
          },
        },
      },
    },
  });
}



function redrawChart() {
  const selectedCountries = $("#countrySelect").val();
  const selectedContinent = $("#continentSelect").val();

  drawCharts();
  // Draw the selected chart type
  createFilteredChart(
    selectedCountries,
    selectedContinent
  );
}

function createFilteredChart(selectedCountries = [], selectedContinent = []) {
  const barChartCanvas = document.getElementById("myBarChart");
  if (chartInstances.myBarChart) {
    chartInstances.myBarChart.destroy();
  }

  const ctx = barChartCanvas.getContext("2d");

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
    barChartCanvas.style = "height: 100vh";
  } else {
    barChartCanvas.style = "height: 37.5rem";
  }
  chartInstances.myBarChart = createBarChart(
    ctx,
    countries,
    iqData,
    expenditureData,
    incomeData,
    temperatureData,
    isMobile
  );
}

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

$(document).ready(function () {
  const isMobile = window.outerWidth <= 600;
  const resizeEvent = isMobile ? "orientationchange" : "resize";

  // Initialize chart instances object
  chartInstances = {
    myChart: null,
    myScatterTempIq: null,
    myScatterEdIq: null,
    myScatterEdIN: null,
  };

  

  redrawChart(); //this is needed to fix the bug where media query is not working even though fetch data calls redrawChart

  $(window).on(resizeEvent, redrawChart);

  $('input[name="chartType"]').on("change", redrawChart);

  // Add event listener for removing country filter button
  let countryRemoveFilterButton = $(".js-button-filter-country-remove");

  countryRemoveFilterButton.on("click", function () {
    $("#countrySelect").val(null).trigger("change");
    redrawChart();
  });



  $("#countrySelect").on("change", redrawChart);

  // Add a new event listener for removing continent filter button
  let continentRemoveFilterButton = $(".js-button-filter-continent-remove");

  continentRemoveFilterButton.on("click", function () {
    $("#continentSelect").val(null).trigger("change");
    redrawChart();
  });

  $("#continentSelect").on("change", redrawChart);

  // Call the fetchData function
  fetchData();
});
