import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <h1 className="bg-black text-red-900 text-3xl font-bold">holaaaa</h1>
  </StrictMode>
);
