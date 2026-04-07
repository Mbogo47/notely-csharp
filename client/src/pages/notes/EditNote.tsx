import { Box, Button, TextField, Paper, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { useReducer, useEffect, useState } from "react";
import { domain } from "../../components/utils/utils";
import {
  editNoteReducer,
  initialEditNoteState,
} from "../../reducers/EditNotesReducer";
import { marked } from "marked";
import DOMPurify from "dompurify";
import axiosInstance from "../../services/axiosInstance";

const EditNote: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(editNoteReducer, initialEditNoteState);
  const [previewHtml, setPreviewHtml] = useState("");

  const token = localStorage.getItem("token");

  const fetchNote = async () => {
   const res = await axiosInstance.get(`/api/notes/${id}`);;
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["note", id],
    queryFn: fetchNote,
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      dispatch({
        type: "RESET",
        payload: {
          title: data.title,
          synopsis: data.synopsis,
          content: data.content,
        },
      });
    }
  }, [data]);

  useEffect(() => {
    const convertMarkdown = async () => {
      if (state.content) {
        const html = await marked.parse(state.content);
        setPreviewHtml(DOMPurify.sanitize(html));
      } else {
        setPreviewHtml("");
      }
    };

    convertMarkdown();
  }, [state.content]);

  const handleUpdate = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const formData = new FormData();
      formData.append("title", state.title);
      formData.append("synopsis", state.synopsis);
      formData.append("content", state.content);
      if (state.notesImage) {
        formData.append("notesImage", state.notesImage);
      }

      await axiosInstance.put(`/api/notes/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Note updated successfully");
      navigate("/dashboard/my-notes");
    } catch (error) {
      toast.error("Failed to update note");
      console.error(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography color="error">Error loading note</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2, padding: 2 }}>
      {/* Form Section */}
      <Paper
        elevation={3}
        sx={{ padding: 3, flex: 1, maxWidth: "50%", overflowY: "auto" }}
      >
        <Typography variant="h5" gutterBottom>
          Edit Note
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Title"
            value={state.title}
            onChange={(e) =>
              dispatch({ type: "SET_TITLE", payload: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Synopsis"
            value={state.synopsis}
            onChange={(e) =>
              dispatch({ type: "SET_SYNOPSIS", payload: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Content"
            multiline
            minRows={6}
            value={state.content}
            onChange={(e) =>
              dispatch({ type: "SET_CONTENT", payload: e.target.value })
            }
            fullWidth
          />
          {/* 
        <Button variant="outlined" component="label">
          Upload New Image
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) =>
              dispatch({
                type: "SET_IMAGE",
                payload: e.target.files?.[0] || null,
              })
            }
          />
        </Button> */}

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            disabled={state.loading}
          >
            {state.loading ? "Updating..." : "Update Note"}
          </Button>
        </Box>
      </Paper>

      {/* Preview Section */}
      {state.content && (
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            flex: 1,
            maxWidth: "50%",
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

export default EditNote;
