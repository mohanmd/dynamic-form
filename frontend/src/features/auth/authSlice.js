import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { TOKEN_KEY, getApiError } from "../../services/ApiService";
import { ENDPOINTS } from "../../constant/ApiEndpoints";

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
    try {
        const response = await api.post(ENDPOINTS.login, credentials);
        const result = response?.data;
        if (response.status === 200) return result?.data;
        return rejectWithValue({ message: result?.message || "Login failed" });
    } catch (error) {
        console.error("login error:", error);
        return rejectWithValue(getApiError(error));
    }
});

const initialState = {
    token: localStorage.getItem(TOKEN_KEY),
    user: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            localStorage.removeItem(TOKEN_KEY);
            state.token = null;
            state.user = null;
            state.status = "idle";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(login.fulfilled, (state, { payload }) => {
                localStorage.setItem(TOKEN_KEY, payload.token);
                state.status = "succeeded";
                state.token = payload.token;
                state.user = payload.user;
            })
            .addCase(login.rejected, (state, { payload }) => {
                state.status = "failed";
                state.error = payload?.message || "Login failed";
            });
    },
});

export const { logout } = authSlice.actions;
export const selectIsAuthenticated = (state) => !!state.auth.token;
export default authSlice.reducer;
