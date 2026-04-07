import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Divider,
  IconButton,
} from "@mui/material";
import { ArrowBackIosNewOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
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

const NoteDetails: React.FC = () => {
  const { id } = useParams();
  const [previewHtml, setPreviewHtml] = useState("");

  const fetchNote = async (): Promise<Note> => {
    const res = await axiosInstance.get(`/api/notes/${id}`);
    return res.data;
  };

  const {
    data: note,
    isLoading,
    isError,
    error,
  } = useQuery<Note>({
    queryKey: ["note", id],
    queryFn: fetchNote,
    enabled: !!id,
  });

  useEffect(() => {
    const convertMarkdown = async () => {
      if (note?.content) {
        try {
          const html = await marked.parse(note.content);
          setPreviewHtml(DOMPurify.sanitize(html));
        } catch (err) {
          console.error("Error parsing markdown:", err);
          setPreviewHtml("");
        }
      } else {
        setPreviewHtml("");
      }
    };

    convertMarkdown();
  }, [note]);

  if (isLoading) {
    return (
      <Box mt={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !note) {
    toast.error("Failed to fetch note");
    console.error(error);
    return (
      <Box mt={4} textAlign="center">
        <Typography color="error">Something went wrong.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              component={Link}
              to="/dashboard/notes"
              size="small"
              sx={{
                color: "primary.main",
                borderRadius: 1,
              }}
            >
              <ArrowBackIosNewOutlined fontSize="small" />
            </IconButton>
            <Typography
              variant="body2"
              component={Link}
              to="/dashboard/notes"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Back to Notes
            </Typography>
          </Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {note.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {note.synopsis}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Typography variant="body2" color="text.secondary">
              By <strong>{note.author.userName}</strong>
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={(theme) => ({
              typography: "body1",
              color: theme.palette.text.primary,
              "& pre": {
                backgroundColor: theme.palette.grey[100],
                padding: "1rem",
                borderRadius: "5px",
                overflowX: "auto",
              },
              "& code": {
                padding: "0.2rem 0.4rem",
                borderRadius: "4px",
                fontFamily: "'Patrick Hand', cursive",
                color: theme.palette.primary.dark,
              },
            })}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default NoteDetails;
