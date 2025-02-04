'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { Box, Button, VStack, Heading, Text } from '@chakra-ui/react';
import { FaMicrosoft } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Login() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await account.createOAuth2Session(
        'microsoft',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/login'
      );
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await account.get();
        if (user) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.log('No active session');
      }
    };
    checkSession();
  }, [router]);

  return (
    <Box 
      display='flex' 
      justifyContent='center' 
      alignItems='center' 
      height='100vh' 
      bgGradient='linear(to-r, blue.500, purple.600)'
    >
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack 
          bg='white' 
          p={10} 
          rounded='xl' 
          shadow='lg' 
          spacing={5} 
          textAlign='center'
        >
          <Heading color='blue.600'>WIST</Heading>
          <Text color='gray.600'>Ingresar</Text>
          <Button 
            leftIcon={<FaMicrosoft />} 
            colorScheme='blue' 
            size='lg' 
            onClick={handleLogin}
          >
            Iniciar Sesión con Microsoft
          </Button>
        </VStack>
      </motion.div>
    </Box>
  );
}
