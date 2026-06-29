import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authSlice";
import {
  loginReducer,
  initialLoginFormState,
} from "../../reducers/loginReducer";
import axiosInstance, { getApiErrorMessage } from "../../services/axiosInstance";

const Login: React.FC = () => {
  const [form, dispatch] = useReducer(loginReducer, initialLoginFormState);
  const navigate = useNavigate();
  const reduxDispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "UPDATE_FIELD",
      field: e.target.name as "identifier" | "password",
      value: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SUBMIT_START" });

    const { identifier, password } = form;

    try {
      const res = await axiosInstance.post("/api/auth/login", {
        identifier,
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id); 
      reduxDispatch(loginSuccess({ token, user }));
      dispatch({ type: "SUBMIT_SUCCESS" });
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      dispatch({
        type: "SUBMIT_FAILURE",
        error: "",
      });

      const message = getApiErrorMessage(error) || "Login failed";
      toast.error(message);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        mt: 4,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        minHeight: "80vh",
        width: "90%",
        maxWidth: 1000,
        margin: "auto",
        borderRadius: 0.8,
        overflow: "hidden",
      }}
    >
      {/* Left - Image */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #FBC4AB",
          borderRadius: 0.8,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundImage: 'url("/sign-in.svg")',
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            padding: 2,
          }}
        />
      </Box>

      {/* Right - Form */}
      <Box
        sx={{
          flex: 1,
          padding: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          border: "1px solid #FBC4AB",
          borderRadius: 0.8,
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <Box
            component="img"
            src="/notely.svg"
            alt="Notely logo"
            sx={{ width: 40, height: 40 }}
          />
        </Box>

        <Typography variant="h6" gutterBottom align="center">
          Sign In to Notely
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email or Username"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            margin="normal"
            disabled={form.loading}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
            disabled={form.loading}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            type="submit"
            disabled={form.loading}
          >
            {form.loading ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
              >
                <CircularProgress size={20} color="inherit" />
                Signing in...
              </Box>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Box>
    </Paper>
  );
};

export default Login;
