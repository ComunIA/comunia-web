import { StrictMode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Navbar } from 'components/Navbar';

export default function App({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <div>
      <StrictMode>
        <ChakraProvider>
          <Navbar />
          <Component {...pageProps} />
        </ChakraProvider>
      </StrictMode>
    </div>
  );
}
