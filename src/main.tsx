import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@/styles/kodeflow-theme.css";
import "@/styles/kodeflow-admin-theme.css";

createRoot(document.getElementById("root")!).render(<App />);
