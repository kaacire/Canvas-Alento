import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./styles/base.css";
import "./styles/themes/romantic-diary.css";
import "./styles/themes/monochrome.css";
import "./styles/themes/doodle.css";
import "./styles/themes/modern-pastel.css";
<<<<<<< HEAD
import "./styles/card.css";
import "./styles/player.css";
import "./styles/editor.css";
import { AuthProvider } from "./lib/auth";
=======
>>>>>>> f43830495e56632532a39106561c090fc78554bb
import { applyTheme } from "./lib/theme";

applyTheme("ROMANTIC_DIARY");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
<<<<<<< HEAD
      <AuthProvider>
        <App />
      </AuthProvider>
=======
      <App />
>>>>>>> f43830495e56632532a39106561c090fc78554bb
    </BrowserRouter>
  </React.StrictMode>,
);
