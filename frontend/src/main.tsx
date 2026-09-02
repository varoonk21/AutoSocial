import React from "react";
import ReactDOM from "react-dom/client";
import { Providers } from "./providers";
import App from "./App";
import { useConfigStore } from "./store/configStore";
import "./index.css";

useConfigStore.getState().fetchS3PublicUrl();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);
