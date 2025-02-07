// app/components/SummaryPopup.tsx
'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  ScaleFade,
} from '@chakra-ui/react';

interface SummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  workTime: number;
  breakTime: number;
}

const SummaryPopup = ({ isOpen, onClose, workTime, breakTime }: SummaryPopupProps) => {
  // Formatear el tiempo en HH:MM:SS
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Resumen de la Jornada</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="start">
            <ScaleFade in={isOpen}>
              <Text fontSize="lg">
                <strong>Total de Horas Trabajadas:</strong> {formatTime(workTime)}
              </Text>
              <Text fontSize="lg">
                <strong>Total de Horas de Break:</strong> {formatTime(breakTime)}
              </Text>
              <Text fontSize="lg">
                <strong>Total de la Jornada:</strong> {formatTime(workTime + breakTime)}
              </Text>
            </ScaleFade>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SummaryPopup;