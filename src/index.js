import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Dynamically set the API base URL for local and deployed environments
window.API_BASE_URL = process.env.REACT_APP_API_URL || "https://ai-resume-maker-gjv8.onrender.com";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
