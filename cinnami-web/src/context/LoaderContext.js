import React, { createContext, useContext, useState } from "react";
import CinnamiLoader from "../components/CinnamiLoader/CinnamiLoader";

const LoaderContext = createContext();
// Carga el contexto del Loader
export function LoaderProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderText, setLoaderText] = useState("cargando ...");

  const showLoader = (text = "cargando ...") => {
    setLoaderText(text);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
  };

  return (
    <LoaderContext.Provider value={{ isLoading, loaderText, showLoader, hideLoader }}>
      {isLoading && <CinnamiLoader text={loaderText} />}
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  return useContext(LoaderContext);
}