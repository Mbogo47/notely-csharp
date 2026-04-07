import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./pages/Home/Home";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import NotFound from "./pages/notfound/NotFound";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes";
import Notes from "./pages/notes/Notes";
import MyNotes from "./pages/notes/MyNotes";
import DashboardLayout from "./pages/Dashboard/Dashboard";
import CreateNotes from "./pages/notes/CreateNotes";
import EditNote from "./pages/notes/EditNote";
import Trash from "./pages/notes/Trash";
import NoteDetails from "./pages/notes/NoteDetails";
import Profile from "./pages/auth/Profile";
import DashboardContent from "./pages/Dashboard/DashboardContent";

function App() {
  return (
    <>
      <Header />

      <Box sx={{ pt: { xs: 4, sm: 6, md: 8 } }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/*" element={<NotFound />} />

          {/* Entire dashboard layout wraps all nested routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested dashboard routes */}
            <Route index element={<Navigate to="analysis" replace />} />
            <Route path="analysis" element={<DashboardContent />} />
            <Route path="notes" element={<Notes />} />
            <Route path="create" element={<CreateNotes />} />
            <Route path="my-notes" element={<MyNotes />} />
            <Route path="edit/:id" element={<EditNote />} />
            <Route path="note/:id" element={<NoteDetails />} />
            <Route path="trash" element={<Trash />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Box>

      <ToastContainer
        toastStyle={{ backgroundColor: "#2A2B3C", color: "#E4C1F9" }}
      />
    </>
  );
}

export default App;
