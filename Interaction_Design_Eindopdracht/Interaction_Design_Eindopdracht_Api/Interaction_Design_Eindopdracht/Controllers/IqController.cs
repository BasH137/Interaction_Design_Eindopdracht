using System.Collections.Generic;
using System.IO;
using System.Linq;
using Interaction_Design_Eindopdracht.Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic.FileIO;

namespace Interaction_Design_Eindopdracht.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IqController : ControllerBase
    {
        private readonly List<CountryIqData> _countryData;

        public IqController()
        {
            // Load the CSV data into memory
            _countryData = LoadDataFromCsv("./Data/Source/IQ_level.csv");
        }

        private List<CountryIqData> LoadDataFromCsv(string filePath)
        {
            var countryDataList = new List<CountryIqData>();

            try
            {
                using (TextFieldParser parser = new TextFieldParser(filePath))
                {
                    parser.TextFieldType = FieldType.Delimited;
                    parser.SetDelimiters(",");

                    while (!parser.EndOfData)
                    {
                        string[] fields = parser.ReadFields();

                        // Assuming the CSV columns are in the order: rank, country, IQ, education_expenditure, avg_income, avg_temp
                        var countryData = new CountryIqData();

                        // Try parsing and handle exceptions
                        if (int.TryParse(fields[0], out int rank))
                            countryData.Rank = rank;
                        else
                            countryData.Rank = 0; // Default value or handle as appropriate

                        countryData.Country = fields[1];

                        if (double.TryParse(fields[2], out double iq))
                            countryData.IQ = iq;
                        else
                            countryData.IQ = 0; // Default value or handle as appropriate

                        if (double.TryParse(fields[3], out double educationExpenditure))
                            countryData.EducationExpenditure = educationExpenditure;
                        else
                            countryData.EducationExpenditure = 0; // Default value or handle as appropriate

                        if (double.TryParse(fields[4], out double avgIncome))
                            countryData.AvgIncome = avgIncome;
                        else
                            countryData.AvgIncome = 0; // Default value or handle as appropriate

                        if (double.TryParse(fields[5], out double avgTemp))
                            countryData.AvgTemp = avgTemp;
                        else
                            countryData.AvgTemp = 0; // Default value or handle as appropriate

                        countryDataList.Add(countryData);
                    }
                    countryDataList.RemoveAt(0); //Removes dummy data
                }
            }
            catch (Exception ex)
            {
                // Handle the exception (log it, throw a custom exception, etc.)
                Console.WriteLine($"Error parsing CSV: {ex.Message}");
            }

            return countryDataList;
        }


        [HttpGet]
        public ActionResult<IEnumerable<CountryIqData>> Get()
        {
            return Ok(_countryData);
        }

        [HttpGet("money-divided-by-1000")]
        public ActionResult<IEnumerable<CountryIqData>> GetWithLowerNumers()
        {
            var newData = _countryData.Select(c =>
            {
                c.EducationExpenditure = c.EducationExpenditure / 1000;
                c.AvgIncome = c.AvgIncome / 1000;
                return c;
            }).ToList();
            return Ok(newData);
        }
    }
}