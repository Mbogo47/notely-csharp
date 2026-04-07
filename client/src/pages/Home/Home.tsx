import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { Typewriter } from "react-simple-typewriter";
import NoteIcon from "@mui/icons-material/Note";
import LockIcon from "@mui/icons-material/Lock";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SpaIcon from "@mui/icons-material/Spa";

const features = [
  {
    icon: <NoteIcon fontSize="large" />,
    title: "Clean Editor",
    desc: "Write with clarity and focus.",
  },
  {
    icon: <LockIcon fontSize="large" />,
    title: "Private Notes",
    desc: "Your thoughts stay yours.",
  },
  {
    icon: <DarkModeIcon fontSize="large" />,
    title: "Dark Mode",
    desc: "Comfort for night writers.",
  },
  {
    icon: <SpaIcon fontSize="large" />,
    title: "Minimal Design",
    desc: "No clutter, just calm.",
  },
];

const Home = () => {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
        px: 2,
        py: 2,
      }}
    >
      {/* Hero Section */}
      <Box textAlign="center" mb={10}>
        <Typography
          variant="h2"
          fontWeight="bold"
          gutterBottom
          sx={{ fontFamily: "inherit", color: "primary.main" }}
        >
          <Typewriter
            words={[
              "Welcome to Notely.",
              "Soft thoughts, sharp words.",
              "Write slow, breathe deep.",
              "Let your thoughts flow.",
            ]}
            loop
            cursor
            cursorStyle="|"
            typeSpeed={50}
            deleteSpeed={40}
            delaySpeed={2000}
          />
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 2 }}>
          A calm space for your mind.
        </Typography>
        <Button
          variant="outlined"
          size="large"
          sx={{
            mt: 4,
            borderRadius: "30px",
            px: 4,
            borderColor: "secondary.main",
            color: "secondary.main",
            fontFamily: "inherit",
            "&:hover": {
              bgcolor: "background.paper",
              borderColor: "secondary.main",
            },
          }}
        >
          Start Writing
        </Button>
      </Box>

      {/* Features Section */}
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        gap={4}
        px={2}
      >
        {features.map((feat, index) => (
          <Card
            key={index}
            elevation={2}
            sx={{
              bgcolor: "background.paper",
              borderRadius: 3,
              textAlign: "center",
              width: { xs: "100%", sm: "45%", md: "22%" },
              minWidth: 200,
              py: 4,
              color: "text.primary",
            }}
          >
            <CardContent>
              <Box mb={2} color="secondary.main">
                {feat.icon}
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {feat.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feat.desc}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Home;
