import React, { useState } from "react";
import axios from "axios";
import "./styles.css";
import DataTable from "./components/DataTable";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterRestaurant, setFilterRestaurant] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post("http://localhost:5000/upload", formData);
      alert("File uploaded successfully");
    } catch (err) {
      alert("Upload failed");
    }
  };

  const filteredData = data.filter((row) => {
    const dateMatch =
      !filterDate ||
      (row["Order Date"] || row["order_date"] || "").includes(filterDate);
    const restaurantMatch =
      !filterRestaurant ||
      (row["Restaurant Name"] || "")
        .toLowerCase()
        .includes(filterRestaurant.toLowerCase());
    return dateMatch && restaurantMatch;
  });

  const handleDisplay = async () => {
    try {
      const res = await axios.get("http://localhost:5000/data");
      if (res.data && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        alert("No data available");
      }
    } catch (err) {
      alert("Failed to fetch data");
    }
  };

  const handleSaveData = async () => {
    try {
      await axios.post("http://localhost:5000/save-data", { data });
      alert("Changes saved");
    } catch (err) {
      alert("Failed to save data");
    }
  };

  const handleEmail = async () => {
    try {
      await axios.post("http://localhost:5000/send-email");
      alert("Email sent");
    } catch (err) {
      alert("Failed to send email");
    }
  };

  const handleFilteredDownload = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/download",
        {
          date: filterDate,
          restaurant: filterRestaurant,
        },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "filtered_output.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Filtered download failed");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.post("http://localhost:5000/delete", {
        date: filterDate,
        restaurant: filterRestaurant,
      });
      alert(res.data.message);
      handleDisplay();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleReset = async () => {
    try {
      await axios.post("http://localhost:5000/reset");
      alert("Data reset");
      setData([]);
    } catch (err) {
      alert("Reset failed");
    }
  };

  return (
    <div className="app-container">
      <div className="app-card">
        <h1 className="app-header">Data Management</h1>
        <div className="button-group">
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
          <button onClick={handleDisplay}>Display</button>
          <button onClick={handleFilteredDownload}>Download (Filtered)</button>
          <button onClick={handleDelete}>Delete (Filtered)</button>
          <button onClick={handleSaveData}>Save Changes</button>
          <button onClick={handleEmail}>Send Email</button>
          <button onClick={handleReset}>Reset</button>
        </div>
        <div className="filters">
          <input
            placeholder="Filter by Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <input
            placeholder="Filter by Restaurant"
            value={filterRestaurant}
            onChange={(e) => setFilterRestaurant(e.target.value)}
          />
        </div>
        <DataTable data={filteredData} setData={setData} />
      </div>
    </div>
  );
}

export default App;
