import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./App.css"
import { AnimeProvider } from "./contexts/AnimeContext"
import { ThemeProvider } from "./contexts/ThemeContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AnimeProvider>
        <App />
      </AnimeProvider>
    </ThemeProvider>
  </React.StrictMode>,
)