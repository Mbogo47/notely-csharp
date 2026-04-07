// import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Card,
  CardContent,
  Typography,
  // CardMedia,
  Box,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
// import { domain } from "../../components/utils/utils";
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
    userName: string;
    firstName: string;
    emailAddress: string;
  };
}

const fetchNotes = async () => {
  const res = await axiosInstance.get("/api/notes");
  return res.data;
};

const Notes: React.FC = () => {
  const {
    data: notes,
    isLoading,
    isError,
    error,
  } = useQuery<Note[]>({ queryKey: ["notes"], queryFn: fetchNotes });
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
      //     wrapperStyle={{}}
      //     wrapperClass="grid-wrapper"
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
        All Notes
      </Typography>
      <Box
        display="grid"
        gap={2}
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      >
        {notes.map((note) => (
          <Card key={note.id}>
            {/* {note.notesImage && (
              <CardMedia
                component="img"
                height="140"
                image={note.notesImage[0]}
                alt={note.title}
              />
            )} */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {note.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {note.synopsis}
              </Typography>
              <Typography variant="caption">
                By: {note.author?.userName}
              </Typography>
              <Box mt={2}>
                <Button
                  component={Link}
                  to={`/dashboard/note/${note.id}`}
                  variant="outlined"
                  size="small"
                >
                  Read More
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default Notes;
