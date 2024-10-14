// src/components/UserContext.jsx
import React, { createContext, useReducer } from 'react';

// Создаем контекст
const Context = createContext();

// Начальное состояние
const initialState = {
    users: [], // Массив пользователей
    services: [],
  reviews: [],
  loading: true,
  error: "",
  editingUserId: null,
  editingServiceId: null,
  editingReviewId: null,
};

// Редюсер для управления состоянием
const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_USERS':
            return { ...state, users: action.payload, loading: false, error: "" };

        case 'SET_SERVICES':
            return { ...state, services: action.payload, loading: false, error: "" };

        case 'SET_REVIEWS':
            return { ...state, reviews: action.payload, loading: false, error: "" };

        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };

        case 'SET_EDITING_USER':
            return { ...state, editingUserId: action.payload };

        case 'SET_EDITING_SERVICE':
            return { ...state, editingServiceId: action.payload };

        case 'SET_EDITING_REVIEW':
            return { ...state, editingReviewId: action.payload };

        case 'CLEAR_EDITING':
            return { ...state, editingUserId: null, editingServiceId: null, editingReviewId: null };

        default:
            return state;
    }
};

// Провайдер контекста
export const Provider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <Context.Provider value={{ state, dispatch }}>
            {children}
        </Context.Provider>
    );
};

export default Context;