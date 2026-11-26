import React from "react";
import { createRoot } from "react-dom/client";
import "./storage.js";
import App from "./App.jsx";
import { keepUpToDate } from "./update.js";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/* look for a newer copy each time the app comes onto the screen, and move onto it */
keepUpToDate();
