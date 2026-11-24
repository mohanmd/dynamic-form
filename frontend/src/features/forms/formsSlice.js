import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiError } from "../../services/ApiService";
import { ENDPOINTS } from "../../constant/ApiEndpoints";

export const getAllForms = createAsyncThunk("forms/getAll", async (params, { rejectWithValue }) => {
    try {
        const response = await api.get(ENDPOINTS.getForms, { params });
        const result = response?.data;
        if (response.status === 200) return { data: result?.data ?? [], meta: result?.meta };
        return rejectWithValue({ message: result?.message });
    } catch (error) {
        console.error("forms get error:", error);
        return rejectWithValue(getApiError(error));
    }
});

export const deleteForm = createAsyncThunk("forms/delete", async (formId, { rejectWithValue }) => {
    try {
        const response = await api.delete(`${ENDPOINTS.deleteForm}/${formId}`);
        const result = response?.data;
        if (response.status === 200) return formId;
        return rejectWithValue({ message: result?.message });
    } catch (error) {
        console.error("form delete error:", error);
        return rejectWithValue(getApiError(error));
    }
});

const formsSlice = createSlice({
    name: "forms",
    initialState: {
        items: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
        status: "idle",
        error: null,
        deleteError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllForms.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getAllForms.fulfilled, (state, { payload }) => {
                state.status = "succeeded";
                state.items = payload.data;
                state.meta = payload.meta ?? state.meta;
            })
            .addCase(getAllForms.rejected, (state, { payload }) => {
                state.status = "failed";
                state.error = payload?.message;
            })
            .addCase(deleteForm.pending, (state) => {
                state.deleteError = null;
            })
            .addCase(deleteForm.fulfilled, (state, { payload: formId }) => {
                state.items = state.items.filter((form) => form._id !== formId);
                state.meta.total = Math.max(0, state.meta.total - 1);
            })
            .addCase(deleteForm.rejected, (state, { payload }) => {
                state.deleteError = payload?.message;
            });
    },
});

export default formsSlice.reducer;
