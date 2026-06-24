import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1A1B26",
      paper: "#2A2B3C",
    },
    primary: { main: "#FBC4AB" },
    secondary: { main: "#E4C1F9" },

    text: {
      primary: "#F8F8F2",
      secondary: "#CFCFE2",
    },
  },
  typography: {
    fontFamily: " 'Noto Sans', sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
