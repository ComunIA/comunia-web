import { Box, Input, Flex, Spacer, Heading } from '@chakra-ui/react';
import { useCookies } from 'react-cookie';

export const Navbar = () => {
  const [cookies, setCookie] = useCookies(['api_key']);
  return (
    <Box as="nav" bg="#12212e" boxShadow="sm" width="100%" h="60px" padding="3">
      <Flex minWidth="max-content" alignItems="center" gap="2">
        <Box p="2">
          <Heading size="md" color="gray.100">
            Comun.IA
          </Heading>
        </Box>
        <Spacer />
        <Input
          gap={2}
          variant="filled"
          type="password"
          width="300px"
          placeholder="API Key"
          size="md"
          value={cookies['api_key']}
          onChange={(e) => setCookie('api_key', e.target.value)}
          className="apiInput"
        />
      </Flex>
    </Box>
  );
};
