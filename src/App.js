import { Select } from '@mui/material';
import React, { useEffect, useState } from "react";
import { FormControl,MenuItem,Card,CardContent } from '@mui/material';
import InfoBox from './InfoBox';
import './App.css';
import MapContainer from './Map';
import "leaflet/dist/leaflet.css";
import LineGraph from "./LineGraph";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import numeral from "numeral";






const App = () => {


  const [countries, setCountries] = useState([]);
  const [country,setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() =>{

    const getCountriesData =async () =>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((Response) => Response.json())
      .then((data) =>{
        const countries = data.map((country) =>(
          {
            name:country.country,
            value:country.countryInfo.iso2
          }
        ));
        let sortedData = sortData(data);
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
      })
    };
    getCountriesData();
    
  },[]);

  console.log(casesType);
  
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setInputCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };
  return (
    <div className="App">
      <div className="app_left"></div>
      <div className="App_header">
      <h1>COVID-19 TRACKER</h1>
      <FormControl className='app_dropdown'>
        <Select variant="outlined"
        onChange={onCountryChange}
        value={country}
        >
          <MenuItem value="worldwide">worldwide</MenuItem>
          {countries.map(country =>(
            <MenuItem value={country.value}> {country.name}</MenuItem>
          ))}
          
        </Select>
      </FormControl>


      <div className='app_stats'>
      <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
      </div>

         <MapContainer
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom} 
          />
      </div>
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType} />
      
    </div>
    </CardContent>
      </Card>
    </div>
  );
};

export default App;
