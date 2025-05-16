import { createContext, useContext, useState } from "react";
import LoadingOverlay from "../components/LoadingOverlay";

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
            <LoadingOverlay isLoading={loading} />
        </LoadingContext.Provider>
    );
};
