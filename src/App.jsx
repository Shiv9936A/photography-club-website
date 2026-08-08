import { Route, Routes } from "react-router";
import HomePage from "./pages/home";

import Events from "./pages/events";
import EventPage from "./pages/events/eventPage";
import Blogs from "./pages/blogs";
import BlogPage from "./pages/blogs/blogPage";

import PhotoReels from "./pages/photoreel";
import Header from "./components/header";

import Footer from "./components/footer";
import PortfolioPage from "./pages/portfolio/portfolio";
import IndividualPortfolio from "./pages/portfolio/individualPortfolio";
import { ThemeProvider } from "./context/ThemeContext";
import PortfolioLayout from "./pages/portfolio/index";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ClubMemberDashboard from "./pages/club-member";
import AdminArea from "./pages/admin-area";
import PrivateGallery from "./pages/private-gallery";

export default function App () {
  return (
    <div>
      <ThemeProvider>
        <div className="bg-complementPrimary">
          <Header />
          <div className="pt-[65px]">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/portfolio" element={<PortfolioLayout />}>
                <Route index element={<PortfolioPage />} />
                <Route
                  path=":id"
                  element={
                    <ProtectedRoute roles={["member", "admin"]}>
                      <IndividualPortfolio />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="/photo-reels" element={<PhotoReels />} />
              <Route path="/events" element={<Events />}>
                <Route
                  path=":id"
                  element={
                    <ProtectedRoute nitkOnly>
                      <EventPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="/blogs" element={<Blogs />}>
                <Route path=":id" element={<BlogPage />} />
              </Route>
              <Route
                path="/club-member"
                element={
                  <ProtectedRoute roles={["member", "admin"]}>
                    <ClubMemberDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-area"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminArea />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/private-gallery"
                element={
                  <ProtectedRoute nitkOnly>
                    <PrivateGallery />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </ThemeProvider>
    </div>
  );
}
