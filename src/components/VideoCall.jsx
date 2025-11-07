import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

export default function VideoCall({ serviceId, donorId, helperId, userRole, onClose }) {
  const [myId, setMyId] = useState('');
  const [peerId, setPeerId] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);

  // Initialize socket and media
  useEffect(() => {
    // Connect to video call server (using Vite proxy in dev, or direct in production)
    const socketUrl = import.meta.env.DEV ? window.location.origin : 'http://localhost:5000';
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      timeout: 10000
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to video server:', socketRef.current.id);
      setMyId(socketRef.current.id);
      setConnectionStatus('Connected');
      
      // Store connection ID in localStorage for peer discovery
      const connectionKey = `video_call_${serviceId}_${userRole}`;
      localStorage.setItem(connectionKey, socketRef.current.id);
      
      // Try to get peer ID from localStorage
      const peerRole = userRole === 'donor' ? 'helper' : 'donor';
      const peerConnectionKey = `video_call_${serviceId}_${peerRole}`;
      const savedPeerId = localStorage.getItem(peerConnectionKey);
      if (savedPeerId) {
        setPeerId(savedPeerId);
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('Connection error');
    });

    socketRef.current.on('disconnect', () => {
      setConnectionStatus('Disconnected');
    });

    socketRef.current.on('callUser', (data) => {
      console.log('Incoming call from:', data.from);
      setIncomingCall({
        from: data.from,
        signal: data.signal
      });
    });

    socketRef.current.on('callAccepted', (signal) => {
      console.log('Call accepted');
      if (peerRef.current) {
        peerRef.current.signal(signal);
        setIsCallActive(true);
      }
    });

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setConnectionStatus('Ready to call');
      })
      .catch((err) => {
        console.error('Could not get user media:', err);
        setConnectionStatus('Camera/Mic access denied');
        alert('Please allow camera and microphone access to use video call feature.');
      });

    return () => {
      // Cleanup
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      // Clear localStorage
      const connectionKey = `video_call_${serviceId}_${userRole}`;
      localStorage.removeItem(connectionKey);
    };
  }, [serviceId, userRole]);

  // Call user
  const callUser = (id) => {
    if (!localStreamRef.current) {
      alert('Camera not ready yet. Please wait.');
      return;
    }

    if (!id) {
      alert('Peer ID not found. Make sure the other party has joined the call.');
      return;
    }

    peerRef.current = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: localStreamRef.current
    });

    peerRef.current.on('signal', (data) => {
      socketRef.current.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: myId
      });
    });

    peerRef.current.on('stream', (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peerRef.current.on('error', (err) => {
      console.error('Peer error:', err);
      alert('Call connection error. Please try again.');
    });

    setIsCallActive(true);
  };

  // Answer call
  const answerCall = () => {
    if (!localStreamRef.current) {
      alert('Camera not ready yet. Please wait.');
      return;
    }

    peerRef.current = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: localStreamRef.current
    });

    peerRef.current.on('signal', (data) => {
      socketRef.current.emit('answerCall', {
        signal: data,
        to: incomingCall.from
      });
    });

    peerRef.current.on('stream', (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peerRef.current.on('error', (err) => {
      console.error('Peer error:', err);
    });

    peerRef.current.signal(incomingCall.signal);
    setIncomingCall(null);
    setIsCallActive(true);
  };

  // Reject call
  const rejectCall = () => {
    setIncomingCall(null);
  };

  // End call
  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCallActive(false);
    if (onClose) onClose();
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>📹 Video Call - Service #{serviceId}</h2>
            <p style={styles.subtitle}>
              {userRole === 'donor' ? 'Connecting with Helper' : 'Connecting with Donor'}
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Connection Status */}
        <div style={styles.statusBar}>
          <span style={{...styles.statusIndicator, background: connectionStatus === 'Connected' ? '#48bb78' : '#ed8936'}} />
          <span style={styles.statusText}>{connectionStatus}</span>
          <span style={styles.myId}>Your ID: {myId || '—'}</span>
        </div>

        {/* Video Containers */}
        <div style={styles.videosContainer}>
          <div style={styles.videoWrapper}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={styles.localVideo}
            />
            <div style={styles.videoLabel}>You ({userRole})</div>
            {isVideoOff && <div style={styles.videoOffOverlay}>📹 Camera Off</div>}
          </div>

          <div style={styles.videoWrapper}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={styles.remoteVideo}
            />
            <div style={styles.videoLabel}>
              {userRole === 'donor' ? 'Helper' : 'Donor'}
            </div>
            {!isCallActive && (
              <div style={styles.waitingOverlay}>
                <div style={styles.waitingText}>
                  {incomingCall ? '📞 Incoming Call...' : '⏳ Waiting for connection...'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Incoming Call Notification */}
        {incomingCall && (
          <div style={styles.incomingCallAlert}>
            <p style={styles.incomingText}>📞 Incoming call...</p>
            <div style={styles.incomingActions}>
              <button onClick={answerCall} style={styles.answerBtn}>
                ✅ Accept
              </button>
              <button onClick={rejectCall} style={styles.rejectBtn}>
                ❌ Decline
              </button>
            </div>
          </div>
        )}

        {/* Peer ID Input for Manual Connection */}
        {!isCallActive && !incomingCall && (
          <div style={styles.connectionSection}>
            <p style={styles.connectionLabel}>
              Enter Peer ID to call (or share your ID: <strong>{myId}</strong>)
            </p>
            <div style={styles.inputGroup}>
              <input
                type="text"
                value={peerId}
                onChange={(e) => setPeerId(e.target.value)}
                placeholder="Paste peer ID here"
                style={styles.input}
              />
              <button
                onClick={() => callUser(peerId)}
                style={styles.callBtn}
                disabled={!peerId || !localStreamRef.current}
              >
                📞 Call
              </button>
            </div>
            <p style={styles.hint}>
              💡 Tip: The {userRole === 'donor' ? 'helper' : 'donor'} should share their ID with you, or you can share your ID with them.
            </p>
          </div>
        )}

        {/* Call Controls */}
        {isCallActive && (
          <div style={styles.controls}>
            <button
              onClick={toggleMute}
              style={{...styles.controlBtn, background: isMuted ? '#e53e3e' : '#4299e1'}}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button
              onClick={toggleVideo}
              style={{...styles.controlBtn, background: isVideoOff ? '#e53e3e' : '#4299e1'}}
              title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
            >
              {isVideoOff ? '📹❌' : '📹'}
            </button>
            <button
              onClick={endCall}
              style={{...styles.controlBtn, background: '#e53e3e'}}
              title="End Call"
            >
              📞❌
            </button>
          </div>
        )}

        {/* Instructions */}
        <div style={styles.instructions}>
          <h4 style={styles.instructionsTitle}>📋 How to use:</h4>
          <ol style={styles.instructionsList}>
            <li>Share your ID ({myId}) with the {userRole === 'donor' ? 'helper' : 'donor'}</li>
            <li>Or paste their ID in the input field above and click "Call"</li>
            <li>Use controls to mute/unmute or turn camera on/off during the call</li>
            <li>Click "End Call" when finished</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    padding: '20px'
  },
  container: {
    background: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px 30px',
    borderRadius: '20px 20px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700'
  },
  subtitle: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    opacity: 0.9
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    fontSize: '20px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusBar: {
    padding: '15px 30px',
    background: '#f7fafc',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #e2e8f0'
  },
  statusIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  statusText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568'
  },
  myId: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: '#718096',
    fontFamily: 'monospace',
    background: 'white',
    padding: '5px 10px',
    borderRadius: '6px'
  },
  videosContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    padding: '30px',
    background: '#1a202c'
  },
  videoWrapper: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#2d3748',
    aspectRatio: '16/9'
  },
  localVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)' // Mirror effect
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  videoLabel: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600'
  },
  videoOffOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px'
  },
  waitingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  waitingText: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600'
  },
  incomingCallAlert: {
    margin: '20px 30px',
    padding: '20px',
    background: '#ebf8ff',
    borderRadius: '12px',
    border: '2px solid #4299e1',
    textAlign: 'center'
  },
  incomingText: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c5282'
  },
  incomingActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  answerBtn: {
    padding: '12px 30px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  rejectBtn: {
    padding: '12px 30px',
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  connectionSection: {
    padding: '20px 30px',
    background: '#f7fafc',
    borderTop: '1px solid #e2e8f0'
  },
  connectionLabel: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#4a5568'
  },
  inputGroup: {
    display: 'flex',
    gap: '10px'
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'monospace'
  },
  callBtn: {
    padding: '12px 30px',
    background: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  hint: {
    margin: '10px 0 0 0',
    fontSize: '12px',
    color: '#718096',
    fontStyle: 'italic'
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    padding: '20px 30px',
    background: '#f7fafc',
    borderTop: '1px solid #e2e8f0'
  },
  controlBtn: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease'
  },
  instructions: {
    padding: '20px 30px',
    background: '#fffaf0',
    borderTop: '1px solid #e2e8f0'
  },
  instructionsTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    color: '#744210'
  },
  instructionsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '14px',
    color: '#975a16',
    lineHeight: '1.8'
  }
};
