'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Updated import for Next.js 13+
import { account } from '@/lib/appwrite'; // Import the Appwrite account service
import { Box, Avatar, Text, Button, Spinner, VStack } from '@chakra-ui/react';


export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    useEffect(() => {
      const fetchUser = async () => {
        try {
          const userData = await account.get();
          const oauthData = await account.getSession('current'); // Obtiene datos de sesión de OAuth
          const accessToken = oauthData?.providerAccessToken; // Token de Microsoft Graph
  
          // Verifica si hay token antes de hacer la solicitud
          let avatarUrl = '';
          if (accessToken) {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
  
            if (response.ok) {
              avatarUrl = URL.createObjectURL(await response.blob());
            }
          }
  
          setUser({
            name: userData.name,
            email: userData.email,
            avatar: avatarUrl || '/default-avatar.png', // Imagen por defecto si falla
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          router.push('/login');
        } finally {
          setLoading(false);
        }
      };
  
      fetchUser();
    }, [router]);
  
    const handleLogout = async () => {
      await account.deleteSession('current');
      router.push('/login');
    };
  
    if (loading) return <Spinner size='xl' />;
  
    return (
      <VStack spacing={4} align='center' mt={10}>
        <Avatar size='xl' src={user?.avatar} />
        <Text fontSize='xl' fontWeight='bold'>{user?.name}</Text>
        <Text fontSize='md' color='gray.500'>{user?.email}</Text>
        <Button colorScheme='red' onClick={handleLogout}>Logout</Button>
      </VStack>
    );
  }