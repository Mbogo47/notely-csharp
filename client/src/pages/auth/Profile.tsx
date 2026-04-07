import {
  Container,
  TextField,
  Button,
  Typography,
  Avatar,
  Box,
} from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { domain } from "../../components/utils/utils";
import {
  profileReducer,
  initialProfileState,
  initialPasswordState,
  passwordReducer,
} from "../../reducers/userProfileReducer";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import axiosInstance from "../../services/axiosInstance";

const Profile = () => {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${domain}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
  });
  const dispatch = useDispatch();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileState, profileDispatch] = useReducer(
    profileReducer,
    initialProfileState,
  );
  const [passwordState, passwordDispatch] = useReducer(
    passwordReducer,
    initialPasswordState,
  );
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
        profileDispatch({
            type: "RESET",
            payload: {
                firstName: user.firstName,
                lastName: user.lastName,
                emailAddress: user.emailAddress,
                username: user.userName, 
                avatarImage: null,
                loading: false,
            },
        });
    }
}, [user]); 

  const handleProfileUpdate = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("username", profileState.username);
    formData.append("firstName", profileState.firstName);
    formData.append("lastName", profileState.lastName);
    if (profileState.avatarImage) {
      formData.append("avatarImage", profileState.avatarImage);
    }

    profileDispatch({ type: "SET_LOADING", payload: true });

    try {
      await axios.put(`${domain}/api/user`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const updatedUserRes = await axios.get(`${domain}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(setUser(updatedUserRes.data));
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      profileDispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handlePasswordUpdate = async () => {
    const token = localStorage.getItem("token");
    setIsUpdatingPassword(true);
    try {
      await axiosInstance.patch(
        `/api/password`,
        {
          currentPassword: passwordState.currentPassword,
          newPassword: passwordState.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("Password updated");
      passwordDispatch({ type: "RESET" });
    } catch (error) {
      toast.error("Failed to update password");
      console.error(error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const allDisabled = profileState.loading || isUpdatingPassword;

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError)
    return <Typography color="error">Failed to load profile</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={6}>
        {/* Profile Section */}
        <Box flex={1}>
          <Typography variant="h5" gutterBottom>
            Profile Information
          </Typography>

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar
              src={
                previewUrl ||
                profileState.avatarImage ||
                user.avatarImage ||
                undefined
              }
              sx={{ width: 64, height: 64 }}
            />

            <Button component="label" variant="outlined" disabled={allDisabled}>
              Upload Avatar
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  profileDispatch({ type: "SET_AVATAR", payload: file });

                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setPreviewUrl(preview);
                  } else {
                    setPreviewUrl(null);
                  }
                }}
              />
            </Button>
          </Box>

          <TextField
            label="First Name"
            fullWidth
            value={profileState.firstName}
            onChange={(e) =>
              profileDispatch({
                type: "SET_FIRSTNAME",
                payload: e.target.value,
              })
            }
            margin="normal"
            disabled={allDisabled}
          />
          <TextField
            label="Last Name"
            fullWidth
            value={profileState.lastName}
            onChange={(e) =>
              profileDispatch({
                type: "SET_LASTNAME",
                payload: e.target.value,
              })
            }
            margin="normal"
            disabled={allDisabled}
          />
          <TextField
            label="Username"
            fullWidth
            value={profileState.username}
            onChange={(e) =>
              profileDispatch({
                type: "SET_USERNAME",
                payload: e.target.value,
              })
            }
            margin="normal"
            disabled={allDisabled}
          />
          <TextField
            label="Email"
            fullWidth
            value={profileState.emailAddress}
            disabled
            margin="normal"
          />

          <Button
            variant="contained"
            onClick={handleProfileUpdate}
            sx={{ mt: 2 }}
            disabled={allDisabled}
          >
            {profileState.loading ? "Updating..." : "Update Profile"}
          </Button>
        </Box>

        {/* Password Section */}
        <Box flex={1}>
          <Typography variant="h5" gutterBottom>
            Update Password
          </Typography>
          <TextField
            label="Current Password"
            fullWidth
            type="password"
            value={passwordState.currentPassword}
            onChange={(e) =>
              passwordDispatch({
                type: "SET_CURRENT",
                payload: e.target.value,
              })
            }
            margin="normal"
            disabled={allDisabled}
          />
          <TextField
            label="New Password"
            fullWidth
            type="password"
            value={passwordState.newPassword}
            onChange={(e) =>
              passwordDispatch({
                type: "SET_NEW",
                payload: e.target.value,
              })
            }
            margin="normal"
            disabled={allDisabled}
          />
          <TextField
            label="Confirm Password"
            fullWidth
            type="password"
            value={passwordState.confirmPassword}
            onChange={(e) =>
              passwordDispatch({
                type: "SET_CONFIRM",
                payload: e.target.value,
              })
            }
            margin="normal"
            disabled={allDisabled}
          />

          <Button
            variant="contained"
            onClick={handlePasswordUpdate}
            sx={{ mt: 2 }}
            disabled={allDisabled}
          >
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Profile;
