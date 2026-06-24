export type EditNoteState = {
  title: string;
  synopsis: string;
  content: string;
  isPublic: boolean;
  loading: boolean;
};

export type EditNoteAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_SYNOPSIS"; payload: string }
  | { type: "SET_CONTENT"; payload: string }
  | { type: "SET_IS_PUBLIC"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET"; payload?: Partial<EditNoteState> };

export const initialEditNoteState: EditNoteState = {
  title: "",
  synopsis: "",
  content: "",
  isPublic: true,
  loading: false,
};

export function editNoteReducer(
  state: EditNoteState,
  action: EditNoteAction,
): EditNoteState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.payload };
    case "SET_SYNOPSIS":
      return { ...state, synopsis: action.payload };
    case "SET_CONTENT":
      return { ...state, content: action.payload };
    case "SET_IS_PUBLIC":
      return {
        ...state, isPublic: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "RESET":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
