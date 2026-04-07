export interface LoginFormState {
  identifier: string;
  password: string;
  loading: boolean;
  error: string | null;
}

export type LoginFormAction =
  | { type: "UPDATE_FIELD"; field: "identifier" | "password"; value: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_FAILURE"; error: string }
  | { type: "RESET" };

export const initialLoginFormState: LoginFormState = {
  identifier: "",
  password: "",
  loading: false,
  error: null,
};

export function loginReducer(
  state: LoginFormState,
  action: LoginFormAction,
): LoginFormState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "SUBMIT_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        loading: false,
      };
    case "SUBMIT_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case "RESET":
      return initialLoginFormState;
    default:
      return state;
  }
}
