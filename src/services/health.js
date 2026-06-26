import api from "./api";

export const checkBackend = () => {
    return api.get("/health/");
};