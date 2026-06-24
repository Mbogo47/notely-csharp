export type createNoteState = {
  title: string;
  synopsis: string;
  content: string;
  description: string;
  isPublic: boolean;
  loading: boolean;
  aiGenerating: boolean;
};

export type createNoteAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_SYNOPSIS"; payload: string }
  | { type: "SET_CONTENT"; payload: string }
  | { type: "SET_DESCRIPTION"; payload: string }
  | { type: "SET_IS_PUBLIC"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_AI_GENERATING"; payload: boolean }
  | { type: "RESET" };

export const initialcreateNoteState: createNoteState = {
  title: "",
  synopsis: "",
  content: "",
  description: "",
  isPublic: true,
  loading: false,
  aiGenerating: false,
};

export function createNoteReducer(
  state: createNoteState,
  action: createNoteAction,
): createNoteState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.payload };
    case "SET_SYNOPSIS":
      return { ...state, synopsis: action.payload };
    case "SET_CONTENT":
      return { ...state, content: action.payload };
    case "SET_DESCRIPTION":
      return { ...state, description: action.payload };
    case "SET_IS_PUBLIC":
      return { ...state, isPublic: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_AI_GENERATING":
      return { ...state, aiGenerating: action.payload };
    case "RESET":
      return initialcreateNoteState;
    default:
      return state;
  }
}