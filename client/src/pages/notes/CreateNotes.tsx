import { useReducer, useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { toast } from "react-toastify";
import { marked } from "marked";
import DOMPurify from "dompurify";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import axiosInstance, { getApiErrorMessage } from "../../services/axiosInstance";
import {
  createNoteReducer,
  initialcreateNoteState,
} from "../../reducers/createNoteReducer";

const CreateNotes: React.FC = () => {
  const [state, dispatch] = useReducer(createNoteReducer, initialcreateNoteState);
  const { title, synopsis, content, loading, aiGenerating } = state;

  const [previewHtml, setPreviewHtml] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState("");

  const isDisabled = loading || aiGenerating;

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

  const handleGenerateAI = async () => {
    if (!description.trim()) {
      toast.error("Please enter a description first.");
      return;
    }

    setModalOpen(false);
    dispatch({ type: "SET_AI_GENERATING", payload: true });

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
              content: `You are a note-writing assistant. Given a description, generate a note with a title, synopsis, and detailed markdown content.

              Description: ${description}

              Respond ONLY with a JSON object — no markdown fences, no preamble — in this exact shape:
              {
                "title": "...",
                "synopsis": "...",
                "content": "... (markdown) ..."
              }`,
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

      const raw = data.choices?.[0]?.message?.content ?? "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      dispatch({ type: "SET_TITLE", payload: parsed.title });
      dispatch({ type: "SET_SYNOPSIS", payload: parsed.synopsis });
      dispatch({ type: "SET_CONTENT", payload: parsed.content });
      toast.success("Note generated!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate note. Check your API key or try again.");
    } finally {
      dispatch({ type: "SET_AI_GENERATING", payload: false });
      setDescription("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await axiosInstance.post(`/api/notes`, {
        title: state.title,
        synopsis: state.synopsis,
        content: state.content,
        isPublic: state.isPublic,
      });
      toast.success("Note created successfully!");
      dispatch({ type: "RESET" });
    } catch (err: any) {
      toast.error(getApiErrorMessage(err) || "Failed to create note.");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <>
      {/* AI Description Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 9999 }}
      >
        <DialogTitle>Generate with AI</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Describe what your note should be about and AI will generate a
            title, synopsis, and content for you.
          </Typography>
          <TextField
            autoFocus
            label="Description"
            placeholder="e.g. A guide on how to use React hooks effectively..."
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
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          padding: { xs: 1, sm: 2 },
        }}
      >
        {/* Form Section */}
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 2, sm: 4 },
            flex: 1,
            minWidth: 0,
          }}
        >
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
                disabled={isDisabled}
              />
              <TextField
                label="Synopsis"
                value={synopsis}
                onChange={(e) =>
                  dispatch({ type: "SET_SYNOPSIS", payload: e.target.value })
                }
                fullWidth
                required
                disabled={isDisabled}
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
                disabled={isDisabled}
              />

              {/* TOGGLES */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: 1,
                }}
              >
                <Button
                  variant={state.isPublic ? "contained" : "outlined"}
                  color="secondary"
                  disabled={isDisabled}
                  onClick={() =>
                    dispatch({ type: "SET_IS_PUBLIC", payload: !state.isPublic })
                  }
                >
                  {state.isPublic ? "Public Note" : "Private Note"}
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
                  {aiGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isDisabled}
                startIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : null
                }
              >
                {loading ? "Creating..." : "Create Note"}
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Preview Section — below form on mobile */}
        {content && (
          <Paper
            elevation={3}
            sx={{
              padding: { xs: 2, sm: 3 },
              flex: 1,
              minWidth: 0,
            }}
          >
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

export default CreateNotes;