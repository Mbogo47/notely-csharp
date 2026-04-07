import { Container, Card, CardContent, Box, useTheme } from "@mui/material";
import { styled } from "@mui/system";

const Shimmer = styled("div")<{ bg1: string; bg2: string }>(({ bg1, bg2 }) => ({
  height: "100px",
  width: "100%",
  borderRadius: "8px",
  background: `linear-gradient(90deg, ${bg1} 25%, ${bg2} 50%, ${bg1} 75%)`,
  backgroundSize: "200% 100%",
  animation: "shimmer 0.8s infinite",
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "-200% 0" },
    "100%": { backgroundPosition: "200% 0" },
  },
}));

const CustomCardLoader: React.FC = () => {
  const theme = useTheme();
  const baseColor = theme.palette.background.paper;
  const highlightColor = theme.palette.action.hover;

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" flexWrap="wrap" gap={3} justifyContent="center">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card
            key={index}
            sx={{
              width: 300,
              borderRadius: 3,
              boxShadow: 3,
              overflow: "hidden",
              backgroundColor: baseColor,
            }}
          >
            <Shimmer bg1={baseColor} bg2={highlightColor} />
            <CardContent>
              <Box
                height={20}
                mb={1}
                bgcolor={highlightColor}
                borderRadius={1}
              />
              <Box
                height={20}
                mb={1}
                bgcolor={highlightColor}
                width="80%"
                borderRadius={1}
              />
              <Box
                height={20}
                bgcolor={highlightColor}
                width="60%"
                borderRadius={1}
              />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default CustomCardLoader;
