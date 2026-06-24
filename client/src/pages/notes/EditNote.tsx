import { Box, Button, TextField, Paper, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useReducer, useEffect, useState } from "react";
import {
  editNoteReducer,
  initialEditNoteState,
} from "../../reducers/EditNotesReducer";
import { marked } from "marked";
import DOMPurify from "dompurify";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import axiosInstance from "../../services/axiosInstance";

const EditNote: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(editNoteReducer, initialEditNoteState);
  const [previewHtml, setPreviewHtml] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const token = localStorage.getItem("token");
  const isDisabled = state.loading || aiGenerating;

  const fetchNote = async () => {
    const res = await axiosInstance.get(`/api/notes/${id}`);
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
          isPublic: data.isPublic,
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

  const handleGenerateAI = async () => {
    if (!description.trim()) {
      toast.error("Please describe what you want to add or change.");
      return;
    }

    setModalOpen(false);
    setAiGenerating(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `You are a note-editing assistant. The user has an existing note and wants to update its content.

Note title: ${state.title}
Note synopsis: ${state.synopsis}

Current content:
${state.content}

What the user wants to add or change: ${description}

Rewrite the full note content in markdown, incorporating the user's requested changes. 
Respond ONLY with the updated markdown content — no JSON, no preamble, no explanations.`,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const reason = data?.error?.message ?? `API error ${response.status}`;
        toast.error(reason);
        return;
      }

      const updatedContent = data.choices?.[0]?.message?.content ?? "";
      dispatch({ type: "SET_CONTENT", payload: updatedContent.trim() });
      toast.success("Content updated by AI!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate. Try again.");
    } finally {
      setAiGenerating(false);
      setDescription("");
    }
  };

  const handleUpdate = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await axiosInstance.put(`/api/notes/${id}`, {
        title: state.title,
        synopsis: state.synopsis,
        content: state.content,
        isPublic: state.isPublic,
      }, {
        headers: { Authorization: `Bearer ${token}` },
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
    <>
      {/* AI Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 9999 }}
      >
        <DialogTitle>Improve with AI</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Title:</strong> {state.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Synopsis:</strong> {state.synopsis}
          </Typography>
          <TextField
            autoFocus
            label="What do you want to add or change?"
            placeholder="e.g. Add a section about error handling, make it more beginner friendly..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) handleGenerateAI();
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Tip: Press Ctrl + Enter to generate
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleGenerateAI}
            variant="contained"
            color="success"
            disabled={!description.trim()}
            startIcon={<AutoAwesomeIcon fontSize="small" />}
          >
            Update Content
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", flexDirection: "row", gap: 2, padding: 2 }}>
        {/* Form Section */}
        <Paper elevation={3} sx={{ padding: 3, flex: 1, maxWidth: "50%", overflowY: "auto" }}>
          <Typography variant="h5" gutterBottom>
            Edit Note
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Title"
              value={state.title}
              onChange={(e) => dispatch({ type: "SET_TITLE", payload: e.target.value })}
              fullWidth
              disabled={isDisabled}
            />
            <TextField
              label="Synopsis"
              value={state.synopsis}
              onChange={(e) => dispatch({ type: "SET_SYNOPSIS", payload: e.target.value })}
              fullWidth
              disabled={isDisabled}
            />
            <TextField
              label="Content"
              multiline
              minRows={6}
              value={state.content}
              onChange={(e) => dispatch({ type: "SET_CONTENT", payload: e.target.value })}
              fullWidth
              disabled={isDisabled}
            />

            {/* TOGGLES */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button
                variant={state.isPublic ? "contained" : "outlined"}
                disabled={isDisabled}
                onClick={() => dispatch({ type: "SET_IS_PUBLIC", payload: !state.isPublic })}
              >
                {state.isPublic ? "Public" : "Private"}
              </Button>

              <Button
                variant="outlined"
                color="success"
                onClick={() => setModalOpen(true)}
                disabled={isDisabled}
                startIcon={
                  aiGenerating
                    ? <CircularProgress size={16} color="inherit" />
                    : <AutoAwesomeIcon fontSize="small" />
                }
              >
                {aiGenerating ? "Generating..." : "Improve with AI"}
              </Button>
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              disabled={isDisabled}
              startIcon={state.loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {state.loading ? "Updating..." : "Update Note"}
            </Button>
          </Box>
        </Paper>

        {/* Preview Section */}
        {state.content && (
          <Paper elevation={3} sx={{ padding: 3, flex: 1, maxWidth: "50%" }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Box dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </Paper>
        )}
      </Box>
    </>
  );
};

export default EditNote;