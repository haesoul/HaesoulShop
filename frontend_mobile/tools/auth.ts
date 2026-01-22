import { API_URL } from '@/CONSTANTS';
import { LoginArgs, RegisterArgs, VerifyArgs } from '@/types/user';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


export const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const refreshToken = async () => {
  try {
    const refresh = await SecureStore.getItemAsync('refresh_token');
    
    if (!refresh) throw new Error('No refresh token');
    const response = await api.post(`api/auth/token/refresh/`, { 
      refresh: refresh 
    });

    const newAccessToken = response.data.access;
    
    await SecureStore.setItemAsync('access_token', newAccessToken);
    
    return newAccessToken;
  } catch (error) {
    console.error('Не удалось обновить токен', error);
    throw error;
  }
};


api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest); 
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const checkToken = async () => {
  const token = await SecureStore.getItemAsync('access_token');
  if (!token) return false;

  try {
    await api.post(`api/auth/token/verify/`, { token });
    return true;
  } catch (error) {
    return false;
  }
};



export const loginUser = async ({ email, password, setLoading, onSuccess }: LoginArgs) => {
  if (!email || !password) {
    console.error('Ошибка', 'Заполните все поля');
    return;
  }
  setLoading(true);
  try {
    const response = await api.post(`api/auth/login/`, {
      email,
      password,
    });

    const data = response.data;

    await SecureStore.setItemAsync('access_token', data.access);
    await SecureStore.setItemAsync('refresh_token', data.refresh);
    
    console.error('Успех', 'Вход выполнен!');
    onSuccess();

  } catch (error: any) {
    if (error.response) {
      console.error('Ошибка', error.response.data.detail || 'Неверный логин или пароль');
    } else if (error.request) {
      console.error('Ошибка сети', 'Не удалось связаться с сервером. Проверьте запущен ли бэкенд.');
    } else {
      console.error('Ошибка', 'Произошла неизвестная ошибка');
    }
  } finally {
    setLoading(false);
  }
};



export const registerUser = async ({ form, setLoading, onSuccess }: RegisterArgs) => {
  if (!form.email || !form.password) {
    console.error('Ошибка', 'Заполните обязательные поля');
    return;
  }

  setLoading(true);
  try {
    await api.post(`api/auth/register/`, form);
    
    onSuccess(form.email);

  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorMsg = JSON.stringify(error.response.data).replace(/[{}"]/g, '');
      console.error(errorMsg);
    } else {
      console.error(error);
    }
  } finally {
    setLoading(false);
  }
};



export const verifyCode = async ({ email, code, setLoading, onSuccess }: VerifyArgs) => {
  if (code.length < 6) {
    console.error('Ошибка', 'Введите 6-значный код');
    return;
  }

  setLoading(true);
  try {
    const response = await api.post(`api/auth/verify-code/`, {
      email,
      code,
    });

    const data = response.data;

    await SecureStore.setItemAsync('access_token', data.tokens.access);
    await SecureStore.setItemAsync('refresh_token', data.tokens.refresh);
    
    onSuccess();

  } catch (error: any) {
    if (error.response) {
       console.error('Ошибка', error.response.data.error || 'Неверный код');
    } else {
       console.error(error);
    }
  } finally {
    setLoading(false);
  }
};

export const logout = async () => {
  try {
    const refresh = await SecureStore.getItemAsync('refresh_token');
    
    if (refresh) {
        await api.post(`/api/auth/logout/`, { refresh });
    }
  } catch (error) {
    console.warn('Logout request failed, clearing local storage anyway');
  } finally {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
  }
};

