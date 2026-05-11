import React, { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

export const ThemeProvider = ThemeContext.Provider;

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  return theme;
};

export default ThemeContext;