// app/components/Timer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Text, VStack, useDisclosure, ScaleFade } from '@chakra-ui/react';
import SummaryPopup from './SummaryPopup';

const Timer = () => {
  const [isWorking, setIsWorking] = useState(false); // Estado para saber si está trabajando
  const [isBreak, setIsBreak] = useState(false); // Estado para saber si está en break
  const [workTime, setWorkTime] = useState(0); // Tiempo trabajado en segundos
  const [breakTime, setBreakTime] = useState(0); // Tiempo de break en segundos
  const { isOpen, onOpen, onClose } = useDisclosure(); // Control del popup de resumen

  // Formatear el tiempo en HH:MM:SS
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Iniciar o pausar el trabajo
  const handleStartPauseWork = () => {
    setIsWorking(!isWorking);
    setIsBreak(false);
  };

  // Iniciar o pausar el break
  const handleStartPauseBreak = () => {
    setIsBreak(!isBreak);
    setIsWorking(false);
  };

  // Finalizar la jornada
  const handleEndDay = () => {
    onOpen(); // Abrir el popup de resumen
    setIsWorking(false);
    setIsBreak(false);
  };

  // Efecto para actualizar el tiempo trabajado
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorking) {
      interval = setInterval(() => {
        setWorkTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorking]);

  // Efecto para actualizar el tiempo de break
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreak) {
      interval = setInterval(() => {
        setBreakTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreak]);

  return (
    <VStack spacing={6} align="center">
      {/* Reloj de trabajo */}
      {isWorking && (
        <ScaleFade in={isWorking} initialScale={0.9}>
          <Box textAlign="center">
            <Text fontSize="4xl" fontWeight="bold" color="teal.500">
              {formatTime(workTime)}
            </Text>
            <Text fontSize="lg" color="gray.600">
              Tiempo trabajando
            </Text>
          </Box>
        </ScaleFade>
      )}

      {/* Reloj de break */}
      {isBreak && (
        <ScaleFade in={isBreak} initialScale={0.9}>
          <Box textAlign="center" transform="scale(0.8)">
            <Text fontSize="4xl" fontWeight="bold" color="orange.500">
              {formatTime(breakTime)}
            </Text>
            <Text fontSize="lg" color="gray.600">
              Tiempo de break
            </Text>
          </Box>
        </ScaleFade>
      )}

      {/* Botones de control */}
      <Button colorScheme="teal" onClick={handleStartPauseWork}>
        {isWorking ? 'Pausar Trabajo' : 'Iniciar Trabajo'}
      </Button>
      <Button colorScheme="orange" onClick={handleStartPauseBreak}>
        {isBreak ? 'Pausar Break' : 'Iniciar Break'}
      </Button>
      <Button colorScheme="red" onClick={handleEndDay}>
        Finalizar Jornada
      </Button>

      {/* Popup de resumen */}
      <SummaryPopup
        isOpen={isOpen}
        onClose={onClose}
        workTime={workTime}
        breakTime={breakTime}
      />

    </VStack>
  );
};

export default Timer;