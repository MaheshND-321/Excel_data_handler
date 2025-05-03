import React, { useState } from "react";
import axios from "axios";
import "./styles.css";
import DataTable from "./components/DataTable";

const VITE_API_BASE_URL = process.env.REACT_APP_API_URL;

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterRestaurant, setFilterRestaurant] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload`, formData);

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
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/data`);
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
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/save-data`, {
        data,
      });
      alert("Changes saved");
    } catch (err) {
      alert("Failed to save data");
    }
  };

  const handleEmail = async () => {
    try {
      const uploadedData = [
        {
          "Commission %": "8",
          Copay: "",
          "Copay Amount": "0",
          "Delivery Discount": "0",
          "GF Platform Fee": "56.79",
          "GST on GF Platform Fee": "10.22",
          "GST on commission %": "18%",
          Locality: "Basavanna nagar main road, hoodi",
          "Net Bill Value": "531",
          "ONDC Order ID": "GF4004741524",
          "Order Date": "2025-03-03T07:57:17.680Z",
          "Order Status": "Completed",
          "Order Total": "709.92",
          "Restaurant ID": "GFFBRTBI1698734884",
          "Restaurant Name": "Biryani boxx1",
          "Self Delivery Charges": "0",
          TCS: "0",
          TDS: "0.571",
          "Total Container Charge": "40",
          "Total GST": "28.58",
          "Total Payable to Merchant": "503.41",
          order_date: "2025-03-03",
        },
      ];

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/send-email`, {
        to: recipientEmail,
        uploaded_data: uploadedData,
      });
      alert("Email sent successfully");
    } catch (err) {
      alert("Error sending email");
    }
  };

  const handleFilteredDownload = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/download`,
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
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/delete`,
        {
          date: filterDate,
          restaurant: filterRestaurant,
        }
      );
      alert(res.data.message);
      handleDisplay();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleReset = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/reset`);
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
          <input
            placeholder="Recipient Email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
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
