import {
  Box,
  Drawer,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Fab,
} from "@mui/material";
import {
  NoteAdd,
  Notes,
  AssignmentInd,
  DeleteOutlineRounded,
  BarChart,
  Menu as MenuIcon,
} from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import { useState } from "react";
import { RootState } from "../../store/store";

const drawerWidth = 80;

const DashboardLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLogoutClick = () => setLogoutDialogOpen(true);
  const handleLogoutConfirm = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/");
    setLogoutDialogOpen(false);
  };
  const handleLogoutCancel = () => setLogoutDialogOpen(false);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { to: "/dashboard/analysis", icon: <BarChart />, label: "Analysis" },
    { to: "/dashboard/notes", icon: <Notes />, label: "All Notes" },
    { to: "/dashboard/create", icon: <NoteAdd />, label: "Create Note" },
    { to: "/dashboard/my-notes", icon: <AssignmentInd />, label: "My Notes" },
    {
      to: "/dashboard/trash",
      icon: <DeleteOutlineRounded />,
      label: "Deleted Notes",
    },
  ];

  const drawerContent = (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      alignItems="center"
      pt={2}
    >
      {navItems.map((item) => (
        <Tooltip title={item.label} placement="right" arrow key={item.to}>
          <IconButton
            component={NavLink}
            to={item.to}
            onClick={() => isMobile && toggleDrawer()}
            sx={{
              color: "inherit",
              "&.active": {
                color: "primary.main",
              },
            }}
          >
            {item.icon}
          </IconButton>
        </Tooltip>
      ))}

      <Tooltip title="Profile" placement="right" arrow>
        <IconButton
          onClick={() => {
            navigate("/dashboard/profile");
            if (isMobile) toggleDrawer();
          }}
        >
          <Avatar
            src={user?.avatarImage || undefined}
            sx={{
              color: !user?.avatarImage ? "secondary.main" : undefined,
              border: !user?.avatarImage ? "2px solid" : undefined,
              borderColor: !user?.avatarImage ? "primary.main" : undefined,
              bgcolor: !user?.avatarImage ? "background.paper" : undefined,
            }}
          >
            {!user?.avatarImage &&
              `${user?.firstName?.[0] ?? ""}${
                user?.lastName?.[0] ?? ""
              }`.toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Tooltip title="Logout" placement="right" arrow>
        <IconButton onClick={handleLogoutClick}>
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            alignItems: "center",
            mt: isMobile ? 0 : 8,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Floating Menu Icon on Mobile */}
      {isMobile && (
        <Fab
          size="medium"
          color="primary"
          onClick={toggleDrawer}
          sx={{
            position: "fixed",
            top: 5,
            right: 16,
            zIndex: 1300,
          }}
        >
          <MenuIcon />
        </Fab>
      )}

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        slotProps={{
          paper: {
            sx: {
              backdropFilter: "blur(8px)",
              backgroundColor: "#1A1B26",
              color: "#fff",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontSize: "2rem",
            textTransform: "uppercase",
          }}
        >
          Confirm Logout
        </DialogTitle>
        <Divider sx={{ width: "100%", my: 1 }} />
        <DialogContent sx={{ textAlign: "center", fontSize: "1.2rem" }}>
          Are you sure you want to log out?
        </DialogContent>
        <DialogActions
          sx={{ justifyContent: "space-between", pb: 4, m: [0, 2] }}
        >
          <Button onClick={handleLogoutCancel} variant="contained">
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleLogoutConfirm}
            variant="contained"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardLayout;
