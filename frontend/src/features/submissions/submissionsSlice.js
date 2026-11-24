import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiError } from "../../services/ApiService";
import { ENDPOINTS } from "../../constant/ApiEndpoints";

export const getAllSubmissions = createAsyncThunk(
    "submissions/getAll",
    // params: page, limit, search, from, to, filterField, filterValue, sortBy, order
    async ({ formId, ...params }, { rejectWithValue }) => {
        try {
            const response = await api.get(`${ENDPOINTS.getSubmissions}/${formId}/submissions`, { params });
            const result = response?.data;
            if (response.status === 200) return result;
            return rejectWithValue({ message: result?.message });
        } catch (error) {
            console.error("submissions get error:", error);
            return rejectWithValue(getApiError(error));
        }
    }
);

export const getSubmissionById = createAsyncThunk("submissions/getById", async (submissionId, { rejectWithValue }) => {
    try {
        const response = await api.get(`${ENDPOINTS.getSubmissionById}/${submissionId}`);
        const result = response?.data;
        if (response.status === 200) return result?.data;
        return rejectWithValue({ message: result?.message });
    } catch (error) {
        console.error("submission get error:", error);
        return rejectWithValue(getApiError(error));
    }
});

export const deleteSubmission = createAsyncThunk("submissions/delete", async (submissionId, { rejectWithValue }) => {
    try {
        const response = await api.delete(`${ENDPOINTS.deleteSubmission}/${submissionId}`);
        const result = response?.data;
        if (response.status === 200) return submissionId;
        return rejectWithValue({ message: result?.message });
    } catch (error) {
        console.error("submission delete error:", error);
        return rejectWithValue(getApiError(error));
    }
});

const submissionsSlice = createSlice({
    name: "submissions",
    initialState: {
        form: null,
        items: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
        status: "idle",
        error: null,
        current: null,
        currentStatus: "idle",
        currentError: null,
        deleteError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllSubmissions.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getAllSubmissions.fulfilled, (state, { payload }) => {
                state.status = "succeeded";
                state.items = payload?.data ?? [];
                state.form = payload?.form;
                state.meta = payload?.meta ?? state.meta;
            })
            .addCase(getAllSubmissions.rejected, (state, { payload }) => {
                state.status = "failed";
                state.error = payload?.message;
            })
            .addCase(getSubmissionById.pending, (state) => {
                state.currentStatus = "loading";
                state.currentError = null;
                state.current = null;
            })
            .addCase(getSubmissionById.fulfilled, (state, { payload }) => {
                state.currentStatus = "succeeded";
                state.current = payload;
            })
            .addCase(getSubmissionById.rejected, (state, { payload }) => {
                state.currentStatus = "failed";
                state.currentError = payload?.message;
            })
            .addCase(deleteSubmission.pending, (state) => {
                state.deleteError = null;
            })
            .addCase(deleteSubmission.fulfilled, (state, { payload: submissionId }) => {
                state.items = state.items.filter((submission) => submission._id !== submissionId);
                state.meta.total = Math.max(0, state.meta.total - 1);
                if (state.current?._id === submissionId) state.current = null;
            })
            .addCase(deleteSubmission.rejected, (state, { payload }) => {
                state.deleteError = payload?.message;
            });
    },
});

export default submissionsSlice.reducer;
