import { useEffect, useRef, useState, useCallback } from 'react';

export const useAudio = () => {
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [error, setError] = useState(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      mediaRecorder.onstart = () => {
        setIsRecording(true);
        setError(null);
      };
      
      mediaRecorder.onstop = () => {
        setIsRecording(false);
        setAudioChunks(chunks);
      };
      
      mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(err.message);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const getAudioBlob = useCallback(() => {
    if (audioChunks.length === 0) return null;
    return new Blob(audioChunks, { type: 'audio/wav' });
  }, [audioChunks]);

  const reset = useCallback(() => {
    setAudioChunks([]);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
    getAudioBlob,
    reset,
  };
};
