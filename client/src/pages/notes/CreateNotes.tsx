import { useReducer, useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { domain } from "../../components/utils/utils";
import axiosInstance from "../../services/axiosInstance";
import {
  createNoteReducer,
  initialcreateNoteState,
} from "../../reducers/createNoteReducer";

const CreateNotes: React.FC = () => {
  const [state, dispatch] = useReducer(
    createNoteReducer,
    initialcreateNoteState,
  );
  const { title, synopsis, content, notesImage, loading } = state;

  const [isPrivate, setIsPrivate] = useState(false);
  // const [aiGenerating, setAiGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    const convertMarkdown = async () => {
      if (content) {
        try {
          const html = await marked.parse(content);
          setPreviewHtml(DOMPurify.sanitize(html));
        } catch (err) {
          console.error("Error parsing markdown:", err);
        }
      } else {
        setPreviewHtml("");
      }
    };

    convertMarkdown();
  }, [content]);

  // const handleGenerateAI = async () => {
  //   if (!title || !synopsis) {
  //     toast.error("Please enter both title and synopsis");
  //     return;
  //   }

  //   setAiGenerating(true);
  //   try {
  //     const token = localStorage.getItem("token");

  //     if (!token) {
  //       toast.error("User not authenticated.");
  //       return;
  //     }

  //     const response = await axios.post(
  //       `${domain}/generate`,
  //       { title, synopsis },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     dispatch({ type: "SET_CONTENT", payload: response.data.markdown });
  //     toast.success("AI-generated content loaded.");
  //   } catch (error: any) {
  //     console.error(error);
  //     toast.error(
  //       error.response?.data?.error || "Failed to generate note content."
  //     );
  //   } finally {
  //     setAiGenerating(false);
  //   }
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("synopsis", synopsis);
    formData.append("content", content);
    if (notesImage) formData.append("notesImage", notesImage);

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      const noteData = {
        title: title.trim(),
        synopsis: synopsis.trim(),
        content: content.trim(),
        isPublic: !isPrivate,
      };

      console.log("Sending note data:", noteData);
      // 1. Create the note
      const res = await axiosInstance.post(`api/notes`, noteData);

      const noteId = res.data.noteId || res.data.id;

      // 2. Make note private if toggle is on
      if (isPrivate) {
        await axiosInstance.patch(`${domain}/notes/public/${noteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      toast.success("Note created successfully!");
      dispatch({ type: "RESET" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create note.");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, padding: 2 }}>
      {/* Form Section */}
      <Paper elevation={3} sx={{ padding: 4, flex: 1, minWidth: "50%" }}>
        <Typography variant="h5" gutterBottom>
          Create a Note
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) =>
                dispatch({ type: "SET_TITLE", payload: e.target.value })
              }
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Synopsis"
              value={synopsis}
              onChange={(e) =>
                dispatch({ type: "SET_SYNOPSIS", payload: e.target.value })
              }
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Content"
              value={content}
              onChange={(e) =>
                dispatch({ type: "SET_CONTENT", payload: e.target.value })
              }
              fullWidth
              multiline
              minRows={6}
              required
              disabled={loading}
            />

            {/* TOGGLES */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Private toggle */}
              <Button
                variant={isPrivate ? "contained" : "outlined"}
                color="secondary"
                onClick={() => setIsPrivate(!isPrivate)}
                disabled={loading}
              >
                {isPrivate ? "Private Note" : "Public Note"}
              </Button>

              {/* AI Generate Button */}
              {/* <Button
                variant="outlined"
                color="success"
                onClick={handleGenerateAI}
                disabled={loading || aiGenerating}
              >
                {aiGenerating ? "Generating..." : "Generate with AI"}
              </Button> */}
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {loading ? "Creating..." : "Create Note"}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Preview Section */}
      {content && (
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            flex: 1,
            minWidth: "50%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Preview
          </Typography>
          <Box dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </Paper>
      )}
    </Box>
  );
};

export default CreateNotes;
