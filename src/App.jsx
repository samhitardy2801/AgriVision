import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Could not connect to the AgriVision backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewScan = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setPage("detect");
  };

  return (
    <div className="app">

      <nav className="navbar">
        <div className="logo" onClick={() => setPage("home")}>
          🌱 AgriVision
        </div>

        <div className="nav-links">
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("detect")}>
            Disease Detection
          </button>
          <button onClick={() => setPage("history")}>
            History
          </button>
        </div>
      </nav>

      {page === "home" && (
        <main className="hero">

          <div className="hero-content">
            <p className="tag">AI-POWERED CROP HEALTH</p>

            <h1>
              Detect Crop Diseases
              <span>With AI</span>
            </h1>

            <p className="description">
              Upload a leaf image and AgriVision will analyze it
              to identify potential crop diseases.
            </p>

            <button
              className="primary-btn"
              onClick={() => setPage("detect")}
            >
              Start Detection →
            </button>
          </div>

          <div className="hero-card">
            <div className="leaf-icon">🌿</div>
            <h2>Healthy Crops</h2>
            <p>Better detection. Better decisions.</p>
          </div>

        </main>
      )}

      {page === "detect" && (
        <main className="page">

          <h1>Disease Detection</h1>

          <p className="subtitle">
            Upload a clear image of a crop leaf.
          </p>

          <div className="upload-box">

            {!selectedImage ? (
              <>
                <div className="upload-icon">🌿</div>

                <h2>Upload Leaf Image</h2>

                <p>Choose an image from your device</p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </>
            ) : (
              <>
                <h2>Selected Leaf</h2>

                <img
                  src={selectedImage}
                  alt="Selected leaf"
                  className="preview-image"
                />

                <p>Image uploaded successfully!</p>

                {!result && (
                  <button
                    className="primary-btn"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? "Analyzing..." : "Analyze Image"}
                  </button>
                )}

                {result && (
                  <div className="result-box">
                    <h2>Prediction Result</h2>

                    <p>
                      <strong>Disease:</strong>{" "}
                      {result.disease}
                    </p>

                    <p>
                      <strong>Confidence:</strong>{" "}
                      {result.confidence}%
                    </p>

                    <button
                      className="primary-btn"
                      onClick={handleNewScan}
                    >
                      New Scan
                    </button>
                  </div>
                )}

                {!result && !loading && (
                  <>
                    <br />

                    <button
                      className="secondary-btn"
                      onClick={() => {
                        setSelectedImage(null);
                        setSelectedFile(null);
                      }}
                    >
                      Choose Another Image
                    </button>
                  </>
                )}
              </>
            )}

          </div>

        </main>
      )}

      {page === "history" && (
        <main className="page">

          <h1>Scan History</h1>

          <p className="subtitle">
            Your previous crop disease scans will appear here.
          </p>

          <div className="empty-history">
            <div>📋</div>

            <h2>No scans yet</h2>

            <p>Start your first disease detection.</p>

            <button
              className="primary-btn"
              onClick={handleNewScan}
            >
              Start Detection
            </button>
          </div>

        </main>
      )}

    </div>
  );
}

export default App;