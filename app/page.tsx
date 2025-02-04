// app/page.tsx
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';

export default function Home() {
  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <VStack spacing={6}>
        <Heading as="h1" size="2xl" color="teal.500" textAlign="center">
          Bienvenido al Portal de Recursos Humanos
        </Heading>
        <Text fontSize="xl" color="gray.600" textAlign="center">
          Gestiona tus recursos humanos de manera eficiente y efectiva.
        </Text>
        <Link href="/login">
          <Button colorScheme="teal" size="lg">
            Iniciar Sesión
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}