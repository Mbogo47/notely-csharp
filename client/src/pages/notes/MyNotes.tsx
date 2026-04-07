import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Container,
  Card,
  CardContent,
  Typography,
  // CardMedia,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import {
  ModeEditOutlineRounded,
  DeleteOutlineRounded,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { domain } from "../../components/utils/utils";
import { Link } from "react-router-dom";
// import { Grid } from "react-loader-spinner";
import CustomCardLoader from "../../components/loader/CustomLoader";
import axiosInstance from "../../services/axiosInstance";

interface Note {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  notesImage: string[];
  author: {
    id: string;
    username: string;
    firstName: string;
    emailAddress: string;
  };
}

const MyNotes: React.FC = () => {
  const queryClient = useQueryClient();

  const userId = localStorage.getItem("userId");
  
  const token = localStorage.getItem("token");

  const fetchMyNotes = async () => {
    // const token = localStorage.getItem("token");
    const res = await axiosInstance.get(`/api/notes/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  };

  const {
    data: notes,
    isLoading,
    isError,
    error,
  } = useQuery<Note[]>({
    queryKey: ["my-notes"],
    queryFn: fetchMyNotes,
  });

  const handleDeleteNote = async (id: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You are not authenticated.");
      return;
    }

    try {
      await axiosInstance.patch(
        `api/notes/${id}/delete`,
        { isDeleted: true },
      );

      toast.success("Note deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-notes"] });
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to delete note");
      }
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      // <Box mt={4} display="flex" justifyContent="center">
      //   <Grid
      //     visible={true}
      //     height="200"
      //     width="200"
      //     color="#FBC4AB"
      //     ariaLabel="grid-loading"
      //     radius="15.5"
      //   />
      // </Box>
      <CustomCardLoader />
    );
  }

  if (isError) {
    toast.error("Failed to fetch notes");
    console.error(error);
    return (
      <Box mt={4} textAlign="center">
        <Typography color="error">Something went wrong.</Typography>
      </Box>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <Box mt={4} textAlign="center">
        <Typography>No notes found.</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        My Notes
      </Typography>
      <Box
        display="grid"
        gap={2}
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      >
        {notes.map((note) => (
          <Card key={note.id}>
            {/* {note.notesImage?.[0] && (
              <CardMedia
                component="img"
                height="140"
                image={note.notesImage[0]}
                alt={note.title}
              />
            )} */}
            <CardContent>
              <Typography variant="h6">{note.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {note.synopsis}
              </Typography>
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button
                  component={Link}
                  to={`/dashboard/note/${note.id}`}
                  variant="outlined"
                  size="small"
                >
                  Read More
                </Button>
                <Box>
                  <IconButton
                    component={Link}
                    to={`/dashboard/edit/${note.id}`}
                  >
                    <ModeEditOutlineRounded fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteNote(note.id)}>
                    <DeleteOutlineRounded fontSize="small" color="error" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default MyNotes;
