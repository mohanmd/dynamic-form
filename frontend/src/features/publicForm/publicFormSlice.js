import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiError } from "../../services/ApiService";
import { ENDPOINTS } from "../../constant/ApiEndpoints";

export const getPublicForm = createAsyncThunk("publicForm/get", async (formId, { rejectWithValue }) => {
    try {
        const response = await api.get(`${ENDPOINTS.getFormById}/${formId}`);
        const result = response?.data;
        if (response.status === 200) return result?.data;
        return rejectWithValue({ message: result?.message });
    } catch (error) {
        console.error("public form get error:", error);
        return rejectWithValue(getApiError(error));
    }
});

export const saveSubmission = createAsyncThunk("publicForm/submit", async ({ formId, data }, { rejectWithValue }) => {
    try {
        const response = await api.post(`${ENDPOINTS.saveSubmission}/${formId}/submissions`, { data });
        const result = response?.data;
        if (response.status === 200 || response.status === 201) return result?.data;
        return rejectWithValue({ message: result?.message });
    } catch (error) {
        console.error("submission save error:", error);
        return rejectWithValue(getApiError(error));
    }
});

const publicFormSlice = createSlice({
    name: "publicForm",
    initialState: {
        form: null,
        status: "idle",
        error: null,
        submitStatus: "idle", // idle | submitting | succeeded | failed
        submitError: null,
        serverErrors: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getPublicForm.pending, (state) => {
                state.status = "loading";
                state.error = null;
                state.form = null;
                state.submitStatus = "idle";
                state.serverErrors = null;
            })
            .addCase(getPublicForm.fulfilled, (state, { payload }) => {
                state.status = "succeeded";
                state.form = payload;
            })
            .addCase(getPublicForm.rejected, (state, { payload }) => {
                state.status = "failed";
                state.error = payload?.status === 404 ? "This form does not exist or is not published." : payload?.message;
            })
            .addCase(saveSubmission.pending, (state) => {
                state.submitStatus = "submitting";
                state.submitError = null;
                state.serverErrors = null;
            })
            .addCase(saveSubmission.fulfilled, (state) => {
                state.submitStatus = "succeeded";
            })
            .addCase(saveSubmission.rejected, (state, { payload }) => {
                state.submitStatus = "failed";
                state.submitError = payload?.message;
                state.serverErrors = payload?.errors;
            });
    },
});

export default publicFormSlice.reducer;
