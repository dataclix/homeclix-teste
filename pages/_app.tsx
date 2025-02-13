
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@material-tailwind/react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/contexts/AuthContexts";
import 'react-toastify/dist/ReactToastify.css'
import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";

export const telaTamanho = atom(0)
export default function App({ Component, pageProps }: AppProps) {
  const [height, setHeight] = useAtom(telaTamanho);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setHeight(window.innerHeight);
      };

      handleResize(); // Set initial height
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);
  return(
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
        <ToastContainer autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  )
}
