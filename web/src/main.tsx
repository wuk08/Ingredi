import { StrictMode } from "react";
import { Capacitor } from "@capacitor/core";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AppStateProvider } from "./data/AppState";
import "./theme/global.css";

document.documentElement.dataset.platform = Capacitor.getPlatform();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppStateProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </AppStateProvider>
  </StrictMode>
);
