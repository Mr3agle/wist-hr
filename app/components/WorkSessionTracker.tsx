import React, { useState, useEffect } from "react";
import { Button, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, VStack, Text, Textarea, useToast } from "@chakra-ui/react";
import { FaPlay, FaPause, FaStop, FaCoffee } from "react-icons/fa";
import { databases } from "@/lib/appwrite"; // Import Appwrite client
import { unique } from "next/dist/build/utils";

const WorkSessionTracker = ({ USER_ID }) => {
  const [isWorking, setIsWorking] = useState(false); // Track if the user is working
  const [isOnBreak, setIsOnBreak] = useState(false); // Track if the user is on a break
  const [workTime, setWorkTime] = useState(0); // Total work time in seconds
  const [breakTime, setBreakTime] = useState(0); // Total break time in seconds
  const [breaksTaken, setBreaksTaken] = useState(0); // Number of breaks taken
  const [workTimer, setWorkTimer] = useState(null); // Work timer interval
  const [breakTimer, setBreakTimer] = useState(null); // Break timer interval
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal control
  const [sessionId, setSessionId] = useState(null); // Store the session ID for updates
  const [notes, setNotes] = useState(""); // Notes for the session
  const [location, setLocation] = useState(null); // User's location
  const toast = useToast(); // For showing notifications

  // Fetch the active session and calculate elapsed time
  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        // Fetch the active session from Appwrite
        const response = await databases.listDocuments(
          process.env._TIMETRACK_DATABASE_ID, // Use environment variable
          process.env._TIMETRACK_COLLECTION_ID, // Use environment variable
          [
            `userId="${USER_ID}"`, // Use the USER_ID prop
            'status="active"', // Only fetch active sessions
          ]
        );

        if (response.documents.length > 0) {
          const session = response.documents[0];
          setSessionId(session.$id); // Store the session ID
          setIsWorking(true); // Set the session as active
          setBreaksTaken(session.breaks.length); // Set the number of breaks taken
          setNotes(session.notes || ""); // Set the session notes
          setLocation(session.location || null); // Set the session location

          // Calculate elapsed time
          const startTime = new Date(session.startTime).getTime();
          const currentTime = Date.now();
          const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);

          // Initialize the timer with the elapsed time
          setWorkTime(elapsedTimeInSeconds);

          // Start the work timer
          setWorkTimer(setInterval(() => setWorkTime((prev) => prev + 1), 1000));
        }
      } catch (error) {
        console.error("Error fetching active session:", error);
      }
    };

    fetchActiveSession();
  }, [USER_ID]); // Add USER_ID to the dependency array

  // Get the user's location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          toast({
            title: "Error getting location",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Start the work session
  const startWork = async () => {

    // Get the user's location
    getLocation();

    setIsWorking(true);
    setWorkTimer(setInterval(() => setWorkTime((prev) => prev + 1), 1000));

    // Create a new Work_sessions document in Appwrite
    try {
      const response = await databases.createDocument(
        process.env._TIMETRACK_DATABASE_ID, // Use environment variable
        process.env._TIMETRACK_COLLECTION_ID, // Use environment variable
        id.unique(), // Auto-generate document ID
        {
          userId: USER_ID, // Use the USER_ID prop
          startTime: new Date().toISOString(),
          status: "active",
          notes: notes, // Store session notes
          location: location, // Store user location
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
          process.env._TIMETRACK_DATABASE_ID, // Use environment variable
          process.env._TIMETRACK_COLLECTION_ID, // Use environment variable
          sessionId, // Document ID
          {
            breaks: [
              ...(await databases.getDocument(
                process.env._TIMETRACK_DATABASE_ID,
                process.env._TIMETRACK_COLLECTION_ID,
                sessionId
              )).breaks,
              {
                breakId: `break_${breaksTaken + 1}`,
                startTime: new Date().toISOString(),
                endTime: null,
                duration: 0,
                notes: notes, // Store break notes
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
        const session = await databases.getDocument(
          process.env._TIMETRACK_DATABASE_ID,
          process.env._TIMETRACK_COLLECTION_ID,
          sessionId
        );
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
          process.env._TIMETRACK_DATABASE_ID, // Use environment variable
          process.env._TIMETRACK_COLLECTION_ID, // Use environment variable
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
          process.env._TIMETRACK_DATABASE_ID, // Use environment variable
          process.env._TIMETRACK_COLLECTION_ID, // Use environment variable
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
    setNotes("");
    setLocation(null);
    onClose();
  };

  return (
    <VStack spacing={4} align="center" mt={10}>
      {/* Work Timer */}
      <Text fontSize="2xl">Work Time: {formatTime(workTime)}</Text>

      {/* Break Timer */}
      {isOnBreak && <Text fontSize="xl">Break Time: {formatTime(breakTime)}</Text>}

      {/* Notes Input */}
      <Textarea
        placeholder="Add notes for your session..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxWidth="400px"
      />

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
            <Text>Location: {location ? `Lat: ${location.latitude}, Long: ${location.longitude}` : "Not available"}</Text>
            <Text>Notes: {notes}</Text>
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