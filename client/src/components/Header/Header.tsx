import {
  AppBar,
  Container,
  Toolbar,
  Box,
  Button,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Link as MuiLink,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useState, useEffect } from "react";

const friendlyMessages = [
  "Hope you're having a fantastic day!",
  "Glad to see you back!",
  "Let’s make today productive!",
  "You’ve got this 💪",
  "Let’s crush some goals today!",
  "Feeling awesome? You should! 😄",
  "Keep up the great work!",
  "Your energy is contagious! ⚡️",
  "Let's do something amazing today ✨",
  "Take a deep breath and own the day 🌟",
  "Great things are coming your way!",
  "Remember to take breaks and stay hydrated 💧",
  "You're doing better than you think!",
  "Every small step counts 🚀",
  "You're unstoppable today 🔥",
  "Welcome back, superstar 🌠",
  "Ready to make an impact?",
  "It's your time to shine 🌞",
  "One step closer to your goals!",
  "Grateful to have you here 🙌",
];

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (user && !welcomeMessage) {
      const random =
        friendlyMessages[Math.floor(Math.random() * friendlyMessages.length)];
      setWelcomeMessage(random);
    }
  }, [user, welcomeMessage]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky">
      <Container>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            py: 1,
          }}
        >
          {/* Left: Logo + App Name */}
          <Box display="flex" alignItems="center">
            <img
              src="/notely.svg"
              alt="Notely Logo"
              style={{ width: 28, height: 28, marginRight: 8 }}
            />
            <MuiLink
              component={RouterLink}
              to="/"
              color="secondary"
              sx={{
                cursor: "pointer",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "1.25rem",
              }}
            >
              Notely
            </MuiLink>
          </Box>

          {/* Right: Authenticated User */}
          {user ? (
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
              }}
            >
              {welcomeMessage && (
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#E4C1F9", fontSize: "1rem" }}
                >
                  {welcomeMessage}
                </Typography>
              )}
            </Box>
          ) : (
            <>
              {/* Desktop Nav */}
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  gap: 1,
                }}
              >
                <Button color="secondary" component={RouterLink} to="/">
                  Home
                </Button>
                <Button color="secondary" component={RouterLink} to="/signin">
                  Sign In
                </Button>
                <Button
                  color="secondary"
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                >
                  Sign Up
                </Button>
              </Box>

              {/* Mobile Menu Icon */}
              <Box sx={{ display: { xs: "flex", sm: "none" } }}>
                <IconButton color="inherit" edge="end" onClick={handleMenuOpen}>
                  <MenuIcon />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/"
                    onClick={handleMenuClose}
                  >
                    Home
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/signin"
                    onClick={handleMenuClose}
                  >
                    Sign In
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/signup"
                    onClick={handleMenuClose}
                  >
                    Sign Up
                  </MenuItem>
                </Menu>
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
