import { createRoot } from "react-dom/client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./index.css";
import { NotificationProvider } from "./utils/NotificationContext";
import { ThemeProvider } from "./utils/ThemeContext";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <DndProvider backend={HTML5Backend}>
    <ThemeProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ThemeProvider>
  </DndProvider>
);
