import React, { useState, useEffect } from "react";
import { Button, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, VStack, Text } from "@chakra-ui/react";
import { FaPlay, FaPause, FaStop, FaCoffee } from "react-icons/fa";
import { databases } from "../lib/appwrite"; // Import Appwrite client

const WorkSessionTracker = () => {
  const [isWorking, setIsWorking] = useState(false); // Track if the user is working
  const [isOnBreak, setIsOnBreak] = useState(false); // Track if the user is on a break
  const [workTime, setWorkTime] = useState(0); // Total work time in seconds
  const [breakTime, setBreakTime] = useState(0); // Total break time in seconds
  const [breaksTaken, setBreaksTaken] = useState(0); // Number of breaks taken
  const [workTimer, setWorkTimer] = useState(null); // Work timer interval
  const [breakTimer, setBreakTimer] = useState(null); // Break timer interval
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control
  const [sessionId, setSessionId] = useState(null); // Store the session ID for updates

  // Start the work session
  const startWork = async () => {
    setIsWorking(true);
    setWorkTimer(setInterval(() => setWorkTime((prev) => prev + 1), 1000));

    // Create a new Work_sessions document in Appwrite
    try {
      const response = await databases.createDocument(
        "YOUR_DATABASE_ID", // Replace with your database ID
        "Work_sessions", // Collection ID
        "unique()", // Auto-generate document ID
        {
          userId: "USER_ID", // Replace with the user's ID
          startTime: new Date().toISOString(),
          status: "active",
          breaks: [],
        }
      );
      setSessionId(response.$id); // Store the session ID for updates
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  // Start a break
  const startBreak = async () => {
    setIsOnBreak(true);
    clearInterval(workTimer); // Pause work timer
    setBreakTimer(setInterval(() => setBreakTime((prev) => prev + 1), 1000));
    setBreaksTaken((prev) => prev + 1);

    // Update the Work_sessions document with the break
    if (sessionId) {
      try {
        await databases.updateDocument(
          "YOUR_DATABASE_ID", // Replace with your database ID
          "Work_sessions", // Collection ID
          sessionId, // Document ID
          {
            breaks: [
              ...(await databases.getDocument("YOUR_DATABASE_ID", "Work_sessions", sessionId)).breaks,
              {
                breakId: `break_${breaksTaken + 1}`,
                startTime: new Date().toISOString(),
                endTime: null,
                duration: 0,
              },
            ],
          }
        );
      } catch (error) {
        console.error("Error updating session with break:", error);
      }
    }
  };

  // End a break
  const endBreak = async () => {
    setIsOnBreak(false);
    clearInterval(breakTimer); // Pause break timer
    setWorkTimer(setInterval(() => setWorkTime((prev) => prev + 1), 1000)); // Resume work timer

    // Update the Work_sessions document to end the break
    if (sessionId) {
      try {
        const session = await databases.getDocument("YOUR_DATABASE_ID", "Work_sessions", sessionId);
        const updatedBreaks = session.breaks.map((breakItem, index) =>
          index === session.breaks.length - 1
            ? {
                ...breakItem,
                endTime: new Date().toISOString(),
                duration: Math.floor((new Date() - new Date(breakItem.startTime)) / 1000),
              }
            : breakItem
        );

        await databases.updateDocument(
          "YOUR_DATABASE_ID", // Replace with your database ID
          "Work_sessions", // Collection ID
          sessionId, // Document ID
          {
            breaks: updatedBreaks,
          }
        );
      } catch (error) {
        console.error("Error updating session with break end:", error);
      }
    }
  };

  // End the work session
  const endShift = async () => {
    clearInterval(workTimer);
    clearInterval(breakTimer);
    setIsWorking(false);
    setIsOnBreak(false);

    // Update the Work_sessions document to end the session
    if (sessionId) {
      try {
        await databases.updateDocument(
          "YOUR_DATABASE_ID", // Replace with your database ID
          "Work_sessions", // Collection ID
          sessionId, // Document ID
          {
            endTime: new Date().toISOString(),
            duration: workTime,
            status: "completed",
          }
        );
      } catch (error) {
        console.error("Error ending session:", error);
      }
    }

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
    setSessionId(null);
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
          {(breaksTaken < 5 || isOnBreak) && (
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