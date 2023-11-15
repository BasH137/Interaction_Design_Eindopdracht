let baseUrl = 'https://localhost:7284';
let data = [];

async function fetchData() {
  try {
    const response = await fetch(`${baseUrl}/api/Iq`);
         data = await response.json();
         console.log(data);

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Function to fetch data from the API
  fetchData();
});
