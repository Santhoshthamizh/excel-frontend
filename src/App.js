// App.js
import React, { useState, useRef } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

function App() {
  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [columns, setColumns] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [chartTitle, setChartTitle] = useState("Sales Chart");
  const [color, setColor] = useState("#1f77b4");
  const [format, setFormat] = useState("json");
  const [chartData, setChartData] = useState(null);
  const [downloadLink, setDownloadLink] = useState("");
  const [currentPage, setCurrentPage] = useState("upload");
  const fileInputRef = useRef(null);

  const chartTypesWithY = ["bar", "line", "scatter", "box", "area", "polar"];

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setSheets([]);
    setSelectedSheet("");
    setColumns([]);
    setXCol("");
    setYCol("");
    setChartData(null);
    setDownloadLink("");

    const formData = new FormData();
    formData.append("file", uploadedFile);

    axios
      .post("https://graphify-backend.onrender.com/upload/", formData)
      .then((res) => {
        setSheets(res.data.sheets);
        setCurrentPage("options");
      })
      .catch(() => alert("Failed to get sheet names"));
  };

  const handleSheetSelect = (sheet) => {
    setSelectedSheet(sheet);
    setColumns([]);
    setXCol("");
    setYCol("");
    setChartData(null);
    setDownloadLink("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sheet_name", sheet);

    axios
      .post("https://graphify-backend.onrender.com/columns/", formData)
      .then((res) => setColumns(res.data.columns))
      .catch(() => alert("Failed to load columns"));
  };

  const handleGenerateChart = async () => {
    if (!file || !selectedSheet || !xCol || (chartTypesWithY.includes(chartType) && !yCol)) {
      alert("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sheet_name", selectedSheet);
    formData.append("chart_type", chartType);
    formData.append("x_col", xCol);
    formData.append("y_col", yCol || "");
    formData.append("chart_title", chartTitle);
    formData.append("color", color);
    formData.append("format", format);

    try {
      if (format === "json") {
        const res = await axios.post("https://graphify-backend.onrender.com/generate/", formData);
        setChartData(JSON.parse(res.data.chart));
        setDownloadLink("");
      } else {
        const res = await axios.post("https://graphify-backend.onrender.com/generate/", formData, {
          responseType: "blob",
        });
        const blob = new Blob([res.data], { type: res.headers["content-type"] });
        const url = URL.createObjectURL(blob);
        setDownloadLink(url);
        setChartData(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error generating chart");
    }
  };

  const handleSampleDataLoad = () => {
    const csvContent = `Category,Sales,Profit,Region
A,100,20,North
B,120,25,South
C,150,30,East
D,130,35,West
E,170,50,North
F,160,40,South
G,180,45,East
H,190,55,West
I,200,60,North
J,210,65,South
K,220,70,East
L,230,75,West
M,240,80,North
N,250,85,South
O,260,90,East`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const fakeFile = new File([blob], "sample.csv", { type: "text/csv" });
    handleFileChange({ target: { files: [fakeFile] } });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5ff", padding: "20px" }}>
      {/* Navbar (only on upload page) */}
      {currentPage === "upload" && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
          backgroundColor: "#4F46E5",
          color: "white",
          borderRadius: "8px",
          marginBottom: "10px"
        }}>
          <div style={{ fontWeight: "bold", fontSize: "20px" }}>📈 Graphify</div>
          <div style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
            <span style={{ cursor: "pointer" }}>About</span>
            <span style={{ cursor: "pointer" }}>Features</span>
            <span style={{ cursor: "pointer" }}>Contact</span>
          </div>
        </div>
      )}

      {/* Home Button (only on options page) */}
      {currentPage === "options" && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#6366F1",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "10px"
            }}
          >
            Home
          </button>
        </div>
      )}

      {/* Upload Page */}
      {currentPage === "upload" && (
        <>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#1e1e2f" }}>
              Convert Excel & CSV into Beautiful Charts
            </h1>
            <p style={{ fontSize: "16px", marginTop: "10px", color: "#555" }}>
              Upload your business data or use sample data to instantly visualize bar, line, pie and more.
            </p>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current.click()}
            style={{
              marginTop: "20px",
              padding: "25px",
              border: "2px dashed #a5b4fc",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              textAlign: "center",
              cursor: "pointer",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <input
              type="file"
              accept=".xlsx,.csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <p style={{ fontWeight: "bold", fontSize: "18px", color: "#1e1e2f" }}>
              Drag & drop a file here
            </p>
            <p style={{ color: "#666", marginTop: "4px" }}>or click to select</p>
          </div>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              onClick={handleSampleDataLoad}
              style={{
                backgroundColor: "#8b5cf6",
                color: "white",
                padding: "10px 18px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Load Sample Business Data
            </button>
          </div>

          {/* Feature Highlights */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "40px",
            flexWrap: "wrap"
          }}>
            {[
              { label: "Multiple Chart Types", color: "#fde68a" },
              { label: "Excel & CSV Support", color: "#bbf7d0" },
              { label: "Export as PNG/PDF", color: "#bfdbfe" },
            ].map((feature, index) => (
              <div key={index} style={{
                backgroundColor: feature.color,
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                minWidth: "200px",
                textAlign: "center"
              }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#1e293b" }}>
                  {feature.label}
                </h3>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Options Page */}
      {currentPage === "options" && (
        <div style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          justifyItems: "center",
          alignItems: "center",
          maxWidth: "1100px",
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          {/* Options dropdowns */}
          <div>
            <label><b>Select Sheet:</b></label><br />
            <select value={selectedSheet} onChange={(e) => handleSheetSelect(e.target.value)}>
              <option value="">-- Choose Sheet --</option>
              {sheets.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label><b>Chart Type:</b></label><br />
            <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
              <option>bar</option>
              <option>line</option>
              <option>scatter</option>
              <option>pie</option>
              <option>histogram</option>
              <option>box</option>
              <option>area</option>
              <option>polar</option>
              <option>treemap</option>
            </select>
          </div>
          <div>
            <label><b>X Column:</b></label><br />
            <select value={xCol} onChange={(e) => setXCol(e.target.value)}>
              <option value="">-- Select --</option>
              {columns.map((col) => (
                <option key={col}>{col}</option>
              ))}
            </select>
          </div>
          {chartTypesWithY.includes(chartType) && (
            <div>
              <label><b>Y Column:</b></label><br />
              <select value={yCol} onChange={(e) => setYCol(e.target.value)}>
                <option value="">-- Select --</option>
                {columns.map((col) => (
                  <option key={col}>{col}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label><b>Chart Title:</b></label><br />
            <input type="text" value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} />
          </div>
          <div>
            <label><b>Color:</b></label><br />
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div>
            <label><b>Export Format:</b></label><br />
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="json">Preview</option>
              <option value="png">PNG</option>
            </select>
          </div>
          <div>
            <button
              onClick={handleGenerateChart}
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Generate
            </button>
          </div>
        </div>
      )}

      {/* Chart Display */}
      {chartData && (
        <div style={{ marginTop: "30px", display: "flex", justifyContent: "center" }}>
          <div style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            maxWidth: "1000px",
            width: "100%"
          }}>
            <Plot data={chartData.data} layout={chartData.layout} />
          </div>
        </div>
      )}

      {/* Download Link */}
      {downloadLink && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <a href={downloadLink} download={`chart.${format}`} style={{ color: "#1D4ED8" }}>
            📥 Click to download {format.toUpperCase()}
          </a>
        </div>
      )}

      {/* Footer (only on upload page) */}
      {currentPage === "upload" && (
        <div style={{ marginTop: "60px", textAlign: "center", fontSize: "14px", color: "#888" }}>
          © 2025 Graphify · Built with ❤️ using React & FastAPI
        </div>
      )}
    </div>
  );
}

export default App;
