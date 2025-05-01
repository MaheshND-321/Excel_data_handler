import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "./components/DataTable";
import "./styles.css";

const App = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  // Load previously saved data on mount
  useEffect(() => {
    const fetchSavedData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/data");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load saved data:", err);
      }
    };
    fetchSavedData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile?.name || "");
  };

  const handleSaveData = async () => {
    try {
      await axios.post("http://localhost:5000/save-data", { data });
      alert("Data saved successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to save data.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/upload", formData);
      const res = await axios.get("http://localhost:5000/data");
      setData(res.data);
      alert("File uploaded successfully.");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get("http://localhost:5000/download", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "processed_output.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      alert("Download failed.");
    }
  };

  const handleEmail = async () => {
    try {
      await axios.post("http://localhost:5000/send-email");
      alert("Email sent successfully.");
    } catch (err) {
      console.error(err);
      alert("Email sending failed.");
    }
  };

  const handleReset = async () => {
    try {
      await axios.post("http://localhost:5000/reset");
      setData([]);
      setFile(null);
      setFileName("");
      alert("Data reset.");
    } catch (err) {
      console.error(err);
      alert("Reset failed.");
    }
  };

  return (
    <div className="app-container">
      <div className="app-card">
        <h1 className="app-header">CSV Assignment Manager</h1>

        <div className="button-group">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="input-cell"
          />
          {fileName && <p className="text-sm text-white">{fileName}</p>}
          {loading && <p className="text-white">Loading...</p>}
          <button onClick={handleUpload} className="upload-btn">
            Upload
          </button>
          <button onClick={handleDownload} className="download-btn">
            Download CSV
          </button>
          <button onClick={handleSaveData} className="save-btn">
            Save Changes
          </button>
          <button onClick={handleEmail} className="email-btn">
            Send Email
          </button>
          <button onClick={handleReset} className="reset-btn">
            Reset
          </button>
        </div>

        {data.length > 0 && <DataTable data={data} setData={setData} />}
      </div>
    </div>
  );
};

export default App;
