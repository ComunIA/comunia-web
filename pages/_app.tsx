import { StrictMode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Navbar } from 'components/Navbar';

export default function App({ Component, pageProps }) {
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
