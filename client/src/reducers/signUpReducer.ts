export interface SignupFormState {
  firstName: string;
  lastName: string;
  emailAddress: string;
  username: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string | null;
}

export type SignupFormAction =
  | {
      type: "UPDATE_FIELD";
      field:
        | "firstName"
        | "lastName"
        | "emailAddress"
        | "username"
        | "password"
        | "confirmPassword";
      value: string;
    }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_FAILURE"; error: string }
  | { type: "RESET" };

export const initialSignupFormState: SignupFormState = {
  firstName: "",
  lastName: "",
  emailAddress: "",
  username: "",
  password: "",
  confirmPassword: "",
  loading: false,
  error: null,
};

export function signupReducer(
  state: SignupFormState,
  action: SignupFormAction,
): SignupFormState {
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
      return initialSignupFormState;
    default:
      return state;
  }
}
