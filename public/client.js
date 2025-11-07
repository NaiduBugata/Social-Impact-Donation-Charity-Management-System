(function () {
  const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 3,
    timeout: 10000
  });
  let localStream = null;
  let peer = null;
  let callerSignal = null;
  let callerId = null;

  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const myIdSpan = document.getElementById('my-id');
  const idToCallInput = document.getElementById('idToCall');
  const callBtn = document.getElementById('callBtn');
  const incomingDiv = document.getElementById('incoming');
  const callerIdSpan = document.getElementById('callerId');
  const answerBtn = document.getElementById('answerBtn');

  // get media
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localStream = stream;
      localVideo.srcObject = stream;
    })
    .catch((err) => {
      console.error('Could not get user media', err);
      alert('Could not access camera/microphone. Make sure you allowed permissions.');
    });

  socket.on('connect', () => {
    console.log('Connected to server');
    myIdSpan.textContent = socket.id;
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    myIdSpan.textContent = 'Connection error - check console';
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    myIdSpan.textContent = 'Disconnected';
  });

  socket.on('callUser', (data) => {
    // incoming call
    callerId = data.from;
    callerSignal = data.signal;
    callerIdSpan.textContent = callerId;
    incomingDiv.style.display = 'block';
  });

  function callUser(id) {
    if (!localStream) return alert('Local media not ready yet');

    peer = new SimplePeer({ initiator: true, trickle: false, stream: localStream });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: socket.id });
    });

    peer.on('stream', (stream) => {
      remoteVideo.srcObject = stream;
    });

    socket.on('callAccepted', (signal) => {
      peer.signal(signal);
    });
  }

  function answerCall() {
    incomingDiv.style.display = 'none';
    if (!localStream) return alert('Local media not ready yet');

    peer = new SimplePeer({ initiator: false, trickle: false, stream: localStream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: callerId });
    });

    peer.on('stream', (stream) => {
      remoteVideo.srcObject = stream;
    });

    peer.signal(callerSignal);
  }

  callBtn.addEventListener('click', () => {
    const id = idToCallInput.value.trim();
    if (!id) return alert('Enter an ID to call');
    callUser(id);
  });

  answerBtn.addEventListener('click', () => {
    answerCall();
  });
})();
