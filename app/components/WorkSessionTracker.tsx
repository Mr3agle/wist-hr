'use client'; // Mark this as a Client Component

import React, { useState, useEffect } from "react";
import { Button, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, VStack, Text } from "@chakra-ui/react";
import { FaPlay, FaPause, FaStop, FaCoffee } from "react-icons/fa";

const WorkSessionTracker = () => {
  const [isWorking, setIsWorking] = useState(false); // Track if the user is working
  const [isOnBreak, setIsOnBreak] = useState(false); // Track if the user is on a break
  const [workTime, setWorkTime] = useState(0); // Total work time in seconds
  const [breakTime, setBreakTime] = useState(0); // Total break time in seconds
  const [breaksTaken, setBreaksTaken] = useState(0); // Number of breaks taken
  const [workTimer, setWorkTimer] = useState(null); // Work timer interval
  const [breakTimer, setBreakTimer] = useState(null); // Break timer interval
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control

  // Start the work session
  const startWork = () => {
    setIsWorking(true);
    setWorkTimer(setInterval(() => setWorkTime((prev) => prev + 1), 1000));
  };

  // Start a break
  const startBreak = () => {
    setIsOnBreak(true);
    clearInterval(workTimer); // Pause work timer
    setBreakTimer(setInterval(() => setBreakTime((prev) => prev + 1), 1000));
    setBreaksTaken((prev) => prev + 1);
  };

  // End a break
  const endBreak = () => {
    setIsOnBreak(false);
    clearInterval(breakTimer); // Pause break timer
    setWorkTimer(setInterval(() => setWorkTime((prev) => prev + 1), 1000)); // Resume work timer
  };

  // End the work session
  const endShift = () => {
    clearInterval(workTimer);
    clearInterval(breakTimer);
    setIsWorking(false);
    setIsOnBreak(false);
    onOpen(); // Show summary modal
  };

  // Format time (seconds to HH:MM:SS)
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Reset session (optional)
  const resetSession = () => {
    setWorkTime(0);
    setBreakTime(0);
    setBreaksTaken(0);
    onClose();
  };

  return (
    <VStack spacing={4} align="center" mt={10}>
      {/* Work Timer */}
      <Text fontSize="2xl">Work Time: {formatTime(workTime)}</Text>

      {/* Break Timer */}
      {isOnBreak && <Text fontSize="xl">Break Time: {formatTime(breakTime)}</Text>}

      {/* Buttons */}
      {!isWorking ? (
        <Button leftIcon={<Icon as={FaPlay} />} colorScheme="green" onClick={startWork}>
          Start Working
        </Button>
      ) : (
        <>
          {breaksTaken < 3 && (
            <Button
              leftIcon={<Icon as={isOnBreak ? FaPause : FaCoffee} />}
              colorScheme="blue"
              onClick={isOnBreak ? endBreak : startBreak}
            >
              {isOnBreak ? "End Break" : "Start Break"}
            </Button>
          )}
          <Button leftIcon={<Icon as={FaStop} />} colorScheme="red" onClick={endShift}>
            End Shift
          </Button>
        </>
      )}

      {/* Summary Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Daily Summary</ModalHeader>
          <ModalBody>
            <Text>Total Work Time: {formatTime(workTime)}</Text>
            <Text>Total Break Time: {formatTime(breakTime)}</Text>
            <Text>Breaks Taken: {breaksTaken}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={resetSession}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default WorkSessionTracker;