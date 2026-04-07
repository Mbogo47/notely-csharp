export type createNoteState = {
  title: string;
  synopsis: string;
  content: string;
  notesImage: File | null;
  loading: boolean;
};

export type createNoteAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_SYNOPSIS"; payload: string }
  | { type: "SET_CONTENT"; payload: string }
  | { type: "SET_IMAGE"; payload: File | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

export const initialcreateNoteState: createNoteState = {
  title: "",
  synopsis: "",
  content: "",
  notesImage: null,
  loading: false,
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
    case "SET_IMAGE":
      return { ...state, notesImage: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "RESET":
      return initialcreateNoteState;
    default:
      return state;
  }
}
