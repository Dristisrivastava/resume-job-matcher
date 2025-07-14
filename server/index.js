const express = require("express");
const cors = require("cors");
const path = require("path");
const analyzeRouter = require("./routes/analyze");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// API route
app.use("/api/analyze", analyzeRouter);

// Serve static files from React app
const buildPath = path.resolve(__dirname, "../client/build");
app.use(express.static(buildPath));

// For all unmatched routes, serve React app
app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
