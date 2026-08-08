import { createRoot } from "react-dom/client";
import "./styles/markdown.css";
import "./index.css";
import "./styles/themes.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { TabContextProvider } from "./context/TabContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <TabContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TabContextProvider>
    </AuthProvider>
  </GoogleOAuthProvider>,
);
