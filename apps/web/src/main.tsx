import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles/base.css";
import "./styles/themes/romantic-diary.css";
import "./styles/themes/monochrome.css";
import "./styles/themes/doodle.css";
import "./styles/themes/modern-pastel.css";
import { applyTheme } from "./lib/theme";

applyTheme("ROMANTIC_DIARY");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
