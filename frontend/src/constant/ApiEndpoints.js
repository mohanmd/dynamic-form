export const ENDPOINTS = {
    // auth
    login: "auth/login",

    // form management
    getForms: "forms",
    getFormById: "forms",
    saveForm: "forms",
    updateForm: "forms",
    deleteForm: "forms",
    publishForm: "forms", // + /:id/publish

    // submissions
    saveSubmission: "forms", // + /:formId/submissions
    getSubmissions: "forms", // + /:formId/submissions
    getSubmissionById: "submissions",
    deleteSubmission: "submissions",
};
