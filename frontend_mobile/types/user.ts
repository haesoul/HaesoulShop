

export interface Address {
  id: number;
  city: string;
  street: string;
  house: string;
  is_default: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  avatar: string | null;
  addresses: Address[];
}

export interface UpdateUserData {
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface LoginArgs {
  email: string;
  password: string;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}
export interface RegisterForm {
  email: string;
  username: string;
  phone_number: string;
  password: string;
}

export interface RegisterArgs {
  form: RegisterForm;
  setLoading: (loading: boolean) => void;
  onSuccess: (email: string) => void;
}



export interface VerifyArgs {
  email: string;
  code: string;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}