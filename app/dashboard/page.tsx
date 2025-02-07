'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, id } from '@/lib/appwrite';
import { Box, Button, VStack, Heading, Text, Avatar, useToast } from '@chakra-ui/react';
import { FaPlay, FaPause, FaClock, FaStop } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Timer from '../components/Timer'

const COLLECTION_ID = '67a64d5c001d8a73f81a'; // Reemplázalo con el ID real de tu colección
const DATABASE_ID = '67a648b90019e3091654'; // Reemplázalo con el ID real de tu base de datos

export default function WorkSession() {
  const router = useRouter();
  const toast = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await account.get();
        const oauthData = await account.getSession('current');
        const accessToken = oauthData?.providerAccessToken;

        let avatarUrl = '/default-avatar.png';
        if (accessToken) {
          const response = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (response.ok) {
            avatarUrl = URL.createObjectURL(await response.blob());
          }
        }

        setUser({
          id: userData.$id,
          name: userData.name,
          email: userData.email,
          avatar: avatarUrl,
        });

        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        const activeSession = response.documents.find(doc => doc.user_id === userData.$id && doc.status !== 'finished');
        setSession(activeSession || null);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const createSession = async () => {
    setLoading(true);
    try {
      const newSession = await databases.createDocument(DATABASE_ID, COLLECTION_ID, id.unique(), {
        user_id: user.id,
        start_time: new Date().toISOString(),
        status: 'active',
      });
      setSession(newSession);
      toast({ title: 'Jornada iniciada', status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      console.error('Error starting session:', error);
    }
    setLoading(false);
  };

  const updateSession = async (updates) => {
    if (!session) return;
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, session.$id, updates);
      setSession(prev => ({ ...prev, ...updates }));
      toast({ title: 'Estado actualizado', status: 'info', duration: 3000, isClosable: true });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleLogout = async () => {
    await account.deleteSession('current');
    router.push('/login');
  };

  return (
    <Box display='flex' justifyContent='center' alignItems='center' height='100vh' bgGradient='linear(to-r, blue.500, purple.600)'>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <VStack bg='white' p={10} rounded='xl' shadow='lg' spacing={5} textAlign='center'>
          {user && (
            <>
              <Avatar src={user.avatar} size='xl' />
              <Heading color='blue.600'>{user.name}</Heading>
              <Text color='gray.600'>{user.email}</Text>
            </>
          )}
          <Text color='gray.600'>{session ? `Estado: ${session.status}` : 'Sin jornada activa'}</Text>
          {!session && <Button leftIcon={<FaPlay />} colorScheme='green' size='lg' onClick={createSession} isLoading={loading}>Iniciar Jornada</Button>}
          {session?.status === 'active' && <Button leftIcon={<FaPause />} colorScheme='yellow' size='lg' onClick={() => updateSession({ break_start_time: new Date().toISOString(), status: 'on_break' })}>Iniciar Break</Button>}
          {session?.status === 'on_break' && <Button leftIcon={<FaClock />} colorScheme='blue' size='lg' onClick={() => updateSession({ resume_time: new Date().toISOString(), status: 'active' })}>Finalizar Break</Button>}
          {session && <Button leftIcon={<FaStop />} colorScheme='red' size='lg' onClick={() => updateSession({ end_time: new Date().toISOString(), status: 'finished' })}>Finalizar Jornada</Button>}
          <Timer></Timer>
          <Button colorScheme='red' onClick={handleLogout}>Logout</Button>
        </VStack>
      </motion.div>
    </Box>
  );
}
