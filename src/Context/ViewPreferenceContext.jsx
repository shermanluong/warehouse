// src/context/ViewPreferenceContext.jsx

import React, { createContext, useContext, useState } from 'react';

const ViewPreferenceContext = createContext();

export const ViewPreferenceProvider = ({ children }) => {
    const [view, setView] = useState(list); // default to list

    return (
        <ViewPreferenceContext.Provider value={{view, setView}}>
            {children}
        </ViewPreferenceContext.Provider>
    );
};

export const useViewPreference = () => useContext(ViewPreferenceContext);