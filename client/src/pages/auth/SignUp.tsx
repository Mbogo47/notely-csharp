import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  signupReducer,
  initialSignupFormState,
} from "../../reducers/signUpReducer";
import { useNavigate } from "react-router-dom";
import { useReducer } from "react";
import { toast } from "react-toastify";
import axiosInstance, { getApiErrorMessage } from "../../services/axiosInstance";

const SignUp = () => {
  const [form, dispatch] = useReducer(signupReducer, initialSignupFormState);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "UPDATE_FIELD",
      field: e.target.name as
        | "firstName"
        | "lastName"
        | "emailAddress"
        | "username"
        | "password",
      value: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SUBMIT_START" });

    const {
      firstName,
      lastName,
      emailAddress,
      username,
      password,
      confirmPassword,
    } = form;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      dispatch({ type: "SUBMIT_FAILURE", error: "Passwords do not match" });
      return;
    }

    try {
      await axiosInstance.post("/api/auth/register", {
        firstName,
        lastName,
        email: emailAddress,
        username,
        password,
      });

      dispatch({ type: "SUBMIT_SUCCESS" });
      toast.success("Signup successful!");
      navigate("/signin");
    } catch (error: any) {
      const message = getApiErrorMessage(error) || "Sign Up failed";
      dispatch({
        type: "SUBMIT_FAILURE",
        error: message,
      });

      toast.error(message);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        marginX: 2,
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
      {/* Left side - Image */}
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
            backgroundImage: 'url("/sign-up.svg")',
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            padding: 2,
          }}
        />
      </Box>

      {/* Right side - Form */}
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
        {/* Logo */}
        <Box display="flex" justifyContent="center" mb={2}>
          <Box
            component="img"
            src="/notely.svg"
            alt="Notely logo"
            sx={{ width: 40, height: 40 }}
          />
        </Box>

        {/* Title */}
        <Typography variant="h6" gutterBottom align="center">
          Sign Up to Notely
        </Typography>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="First Name "
            margin="normal"
            required
            value={form.firstName}
            onChange={handleChange}
            disabled={form.loading}
            name="firstName"
          />
          <TextField
            fullWidth
            label="Last Name "
            margin="normal"
            required
            value={form.lastName}
            onChange={handleChange}
            disabled={form.loading}
            name="lastName"
          />
          <TextField
            fullWidth
            label="Username "
            margin="normal"
            required
            value={form.username}
            onChange={handleChange}
            disabled={form.loading}
            name="username"
          />
          <TextField
            fullWidth
            label="Email "
            margin="normal"
            required
            value={form.emailAddress}
            onChange={handleChange}
            disabled={form.loading}
            name="emailAddress"
          />
          <TextField
            fullWidth
            label="Password"
            margin="normal"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            disabled={form.loading}
            name="password"
          />
          <TextField
            fullWidth
            label="Confirm Password"
            margin="normal"
            type="password"
            required
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={form.loading}
            name="confirmPassword"
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
                Signing Up...
              </Box>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </Box>
    </Paper>
  );
};

export default SignUp;
