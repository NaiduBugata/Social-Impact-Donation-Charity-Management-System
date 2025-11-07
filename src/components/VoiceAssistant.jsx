import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [capturedText, setCapturedText] = useState('');
  const [liveText, setLiveText] = useState('');
  const [response, setResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const navigate = useNavigate();

  // Available languages with their codes and display names
const supportedLanguages = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
];


  // Language-specific responses
  const languageResponses = {
    'en-US': {
      welcome: 'Hello! I am your Social Impact voice assistant. How can I help you today?',
      listening: 'Listening...',
      speaking: 'Speaking...',
      processing: 'Processing...',
      notUnderstood: 'I am not sure I understood that. You can ask me to navigate to different pages, login, find campaigns, or get information about donations and volunteering.',
      noMicrophone: 'Microphone access is blocked. Please allow microphone permissions to use voice assistant.',
      noMicrophoneFound: 'No microphone found. Please check your microphone connection.',
      error: 'I encountered an error. Please try again.',
      home: 'Navigating to home page',
      login: 'Which role would you like to login as? You can say donor, helper, receiver, organization, or admin.',
      donor: 'Opening donor login page',
      helper: 'Opening helper login page',
      receiver: 'Opening receiver login page',
      organization: 'Opening organization login page',
      admin: 'Opening admin login page',
      campaigns: 'We currently have active campaigns across different categories. Would you like to browse them?',
      createCampaign: 'To create a campaign, please login as a donor first.',
      capabilities: 'I am your Social Impact voice assistant. I can help you navigate the website, find campaigns, login to your account, get information about donations, volunteering, and much more.',
      howToDonate: 'To donate, first login as a donor, then browse active campaigns, select a campaign you like, and click the donate button.',
      howToHelp: 'To volunteer your services, you need to register as a helper. Your account will require admin approval.',
      impactStories: 'Opening impact stories page where you can see real-life success stories from our platform',
      notLoggedIn: 'You are not logged in. Would you like to login or register?',
      goodbye: 'Goodbye! Have a great day making an impact!',
      changeLanguage: 'Changing language to English'
    },
    'hi-IN': {
      welcome: 'नमस्ते! मैं आपका सोशल इम्पैक्ट वॉयस असिस्टेंट हूं। आज मैं आपकी कैसे मदद कर सकता हूं?',
      listening: 'सुन रहा हूं...',
      speaking: 'बोल रहा हूं...',
      processing: 'प्रोसेसिंग...',
      notUnderstood: 'मुझे समझ नहीं आया। आप मुझसे विभिन्न पेजों पर नेविगेट करने, लॉगिन करने, अभियान ढूंढने, या दान और स्वयंसेवा के बारे में जानकारी मांग सकते हैं।',
      noMicrophone: 'माइक्रोफोन एक्सेस ब्लॉक है। कृपया वॉयस असिस्टेंट का उपयोग करने के लिए माइक्रोफोन अनुमति दें।',
      noMicrophoneFound: 'माइक्रोफोन नहीं मिला। कृपया अपना माइक्रोफोन कनेक्शन जांचें।',
      error: 'मैंने एक त्रुटि का सामना किया। कृपया पुनः प्रयास करें।',
      home: 'होम पेज पर नेविगेट कर रहा हूं',
      login: 'आप किस भूमिका के रूप में लॉगिन करना चाहते हैं? आप दाता, सहायक, प्राप्तकर्ता, संगठन, या व्यवस्थापक कह सकते हैं।',
      donor: 'दाता लॉगिन पेज खोल रहा हूं',
      helper: 'सहायक लॉगिन पेज खोल रहा हूं',
      receiver: 'प्राप्तकर्ता लॉगिन पेज खोल रहा हूं',
      organization: 'संगठन लॉगिन पेज खोल रहा हूं',
      admin: 'व्यवस्थापक लॉगिन पेज खोल रहा हूं',
      campaigns: 'हमारे पास विभिन्न श्रेणियों में सक्रिय अभियान हैं। क्या आप उन्हें ब्राउज़ करना चाहेंगे?',
      createCampaign: 'अभियान बनाने के लिए, कृपया पहले दाता के रूप में लॉगिन करें।',
      capabilities: 'मैं आपका सोशल इम्पैक्ट वॉयस असिस्टेंट हूं। मैं आपकी वेबसाइट नेविगेशन, अभियान ढूंढने, अकाउंट में लॉगिन, दान और स्वयंसेवा की जानकारी देने में मदद कर सकता हूं।',
      howToDonate: 'दान करने के लिए, पहले दाता के रूप में लॉगिन करें, फिर सक्रिय अभियान ब्राउज़ करें, एक अभियान चुनें, और दान बटन पर क्लिक करें।',
      howToHelp: 'अपनी सेवाएं स्वेच्छा से देने के लिए, आपको एक सहायक के रूप में पंजीकरण करना होगा। आपके अकाउंट को व्यवस्थापक स्वीकृति की आवश्यकता होगी।',
      impactStories: 'प्रभाव कहानियां पेज खोल रहा हूं जहां आप हमारे प्लेटफॉर्म की वास्तविक जीवन की सफल कहानियां देख सकते हैं',
      notLoggedIn: 'आप लॉग इन नहीं हैं। क्या आप लॉगिन या पंजीकरण करना चाहेंगे?',
      goodbye: 'अलविदा! प्रभाव बनाने का एक शानदार दिन हो!',
      changeLanguage: 'भाषा हिंदी में बदल रहा हूं'
    },
    'te-IN': {
      welcome: 'నమస్కారం! నేను మీ సోషల్ ఇంపాక్ట్ వాయిస్ అసిస్టెంట్. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?',
      listening: 'వినడం...',
      speaking: 'మాట్లాడడం...',
      processing: 'ప్రాసెస్ చేయడం...',
      notUnderstood: 'నాకు అర్థం కాలేదు. మీరు వేర్వేరు పేజీలకు నావిగేట్ చేయడం, లాగిన్ అవ్వడం, క్యాంపెయిన్లను కనుగొనడం, లేదా దానం మరియు స్వచ్ఛంద సేవ గురించి సమాచారం కోసం అడగవచ్చు.',
      noMicrophone: 'మైక్రోఫోన్ యాక్సెస్ బ్లాక్ చేయబడింది. వాయిస్ అసిస్టెంట్ ఉపయోగించడానికి దయచేసి మైక్రోఫోన్ అనుమతులు ఇవ్వండి.',
      noMicrophoneFound: 'మైక్రోఫోన్ కనుగొనబడలేదు. దయచేసి మీ మైక్రోఫోన్ కనెక్షన్ తనిఖీ చేయండి.',
      error: 'నేను ఒక లోపాన్ని ఎదుర్కొన్నాను. దయచేసి మళ్లీ ప్రయత్నించండి.',
      home: 'హోమ్ పేజీకి నావిగేట్ చేస్తున్నాను',
      login: 'మీరు ఏ రోల్‌లో లాగిన్ అవ్వాలనుకుంటున్నారు? మీరు దాత, సహాయకుడు, రిసీవర్, ఆర్గనైజేషన్ లేదా అడ్మిన్ అని చెప్పవచ్చు.',
      donor: 'దాత లాగిన్ పేజీ తెరుస్తున్నాను',
      helper: 'సహాయకుడు లాగిన్ పేజీ తెరుస్తున్నాను',
      receiver: 'రిసీవర్ లాగిన్ పేజీ తెరుస్తున్నాను',
      organization: 'ఆర్గనైజేషన్ లాగిన్ పేజీ తెరుస్తున్నాను',
      admin: 'అడ్మిన్ లాగిన్ పేజీ తెరుస్తున్నాను',
      campaigns: 'మాకు ప్రస్తుతం వివిధ కేటగిరీలలో యాక్టివ్ క్యాంపెయిన్లు ఉన్నాయి. మీరు వాటిని బ్రౌజ్ చేయాలనుకుంటున్నారా?',
      createCampaign: 'క్యాంపెయిన్ సృష్టించడానికి, దయచేసి ముందుగా దాతగా లాగిన్ అవ్వండి.',
      capabilities: 'నేను మీ సోషల్ ఇంపాక్ట్ వాయిస్ అసిస్టెంట్. నేను వెబ్‌సైట్ నావిగేషన్, క్యాంపెయిన్లు కనుగొనడం, అకౌంట్‌లోకి లాగిన్ అవ్వడం, దానం మరియు స్వచ్ఛంద సేవ గురించి సమాచారం ఇవ్వడంలో మీకు సహాయపడగలను.',
      howToDonate: 'దానం చేయడానికి, ముందుగా దాతగా లాగిన్ అవ్వండి, తర్వాత యాక్టివ్ క్యాంపెయిన్లను బ్రౌజ్ చేయండి, మీకు నచ్చిన క్యాంపెయిన్‌ను ఎంచుకోండి మరియు దానం బటన్‌పై క్లిక్ చేయండి.',
      howToHelp: 'మీ సేవలను స్వచ్ఛందంగా అందించడానికి, మీరు సహాయకుడిగా రిజిస్టర్ అవ్వాలి. మీ అకౌంట్‌కు అడ్మిన్ ఆమోదం అవసరం.',
      impactStories: 'ఇంపాక్ట్ స్టోరీస్ పేజీ తెరుస్తున్నాను, ఇక్కడ మీరు మా ప్లాట్‌ఫార్మ్ నుండి నిజజీవిత విజయ కథనాలను చూడవచ్చు',
      notLoggedIn: 'మీరు లాగిన్ అవ్వలేదు. మీరు లాగిన్ లేదా రిజిస్టర్ అవ్వాలనుకుంటున్నారా?',
      goodbye: 'వీడ్కోలు! ప్రభావం చూపించడంలో గొప్ప రోజు కలిగించండి!',
      changeLanguage: 'భాష తెలుగుకు మారుస్తున్నాను'
    },
    'es-ES': {
      welcome: '¡Hola! Soy tu asistente de voz de Impacto Social. ¿Cómo puedo ayudarte hoy?',
      listening: 'Escuchando...',
      speaking: 'Hablando...',
      processing: 'Procesando...',
      notUnderstood: 'No estoy seguro de haber entendido eso. Puedes pedirme que navegue a diferentes páginas, inicie sesión, busque campañas o obtenga información sobre donaciones y voluntariado.',
      changeLanguage: 'Cambiando idioma a español'
    }
    // Add more languages as needed
  };

  // Get response for current language
  const t = (key) => {
    return languageResponses[currentLanguage]?.[key] || languageResponses['en-US'][key];
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      speak(t('error'));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = currentLanguage;

    recognitionRef.current.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      console.log('Speech recognition result received');
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        setLiveText(interimTranscript);
      }

      if (finalTranscript) {
        finalTranscriptRef.current = finalTranscript.trim();
        setCapturedText(finalTranscript.trim());
        setLiveText('');
      }
    };

    recognitionRef.current.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      if (finalTranscriptRef.current && finalTranscriptRef.current.length > 0) {
        const textToProcess = finalTranscriptRef.current;
        finalTranscriptRef.current = '';
        processVoiceCommand(textToProcess);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          speak(t('noMicrophone'));
          break;
        case 'audio-capture':
          speak(t('noMicrophoneFound'));
          break;
        case 'network':
          speak('Network error occurred. Please check your internet connection.');
          break;
        default:
          speak(t('error'));
      }
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      window.speechSynthesis.cancel();
    };
  }, [currentLanguage]); // Re-initialize when language changes

  // Process voice command
  const processVoiceCommand = useCallback((command) => {
    if (!command || command.trim().length === 0) return;
    
    console.log('Processing command:', command);
    setIsProcessing(true);
    addToHistory('user', command);
    setCapturedText('');
    setLiveText('');
    handleVoiceCommand(command);
    setIsProcessing(false);
  }, [currentLanguage]);

  // Text-to-Speech function
  const speak = useCallback((text) => {
    if (!text || text.trim().length === 0) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage;
    utterance.pitch = 1;
    utterance.rate = 0.9;
    utterance.volume = 1;

    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    try {
      window.speechSynthesis.speak(utterance);
      setResponse(text);
      addToHistory('assistant', text);
    } catch (error) {
      console.error('Error speaking:', error);
      setIsSpeaking(false);
    }
  }, [currentLanguage]);

  // Change language
  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    const langName = supportedLanguages.find(lang => lang.code === langCode)?.name || 'Unknown';
    speak(`${t('changeLanguage')} - ${langName}`);
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) {
      speak(t('error'));
      return;
    }

    if (isListening) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCapturedText('');
    setLiveText('');
    finalTranscriptRef.current = '';

    try {
      recognitionRef.current.start();
      console.log('Starting speech recognition...');
    } catch (error) {
      console.error('Error starting recognition:', error);
      speak(t('error'));
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
      console.log('Stopping speech recognition...');
    } catch (error) {
      console.error('Error stopping recognition:', error);
      setIsListening(false);
    }
  };

  // Add message to conversation history
  const addToHistory = (role, message) => {
    if (!message || message.trim().length === 0) return;
    
    setConversationHistory(prev => [
      ...prev, 
      { 
        role, 
        message: message.trim(), 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  };

  // Handle voice commands and questions
  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase().trim();
    console.log('Handling command:', lowerCommand);

    // Language change commands
    if (lowerCommand.includes('change language') || lowerCommand.includes('switch language') || lowerCommand.includes('భాష మార్చండి') || lowerCommand.includes('భాష మారు')) {
      speak('Which language would you like to use? You can say English, Hindi, Telugu, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Arabic, or Russian.');
      return;
    }
    else if (lowerCommand.includes('english') || lowerCommand.includes('ఆంగ్లం') || lowerCommand.includes('ఇంగ్లీషు')) {
      changeLanguage('en-US');
      return;
    }
    else if (lowerCommand.includes('hindi') || lowerCommand.includes('हिंदी') || lowerCommand.includes('హిందీ')) {
      changeLanguage('hi-IN');
      return;
    }
    else if (lowerCommand.includes('telugu') || lowerCommand.includes('తెలుగు')) {
      changeLanguage('te-IN');
      return;
    }
    else if (lowerCommand.includes('spanish') || lowerCommand.includes('español')) {
      changeLanguage('es-ES');
      return;
    }
    else if (lowerCommand.includes('french') || lowerCommand.includes('français')) {
      changeLanguage('fr-FR');
      return;
    }
    else if (lowerCommand.includes('german') || lowerCommand.includes('deutsch')) {
      changeLanguage('de-DE');
      return;
    }

    // Navigation commands
    if (lowerCommand.includes('home') || lowerCommand.includes('main page') || lowerCommand.includes('homepage') || lowerCommand.includes('ముఖ్య పేజీ') || lowerCommand.includes('హోమ్')) {
      speak(t('home'));
      setTimeout(() => navigate('/'), 1000);
    }
    else if (lowerCommand.includes('login') || lowerCommand.includes('sign in') || lowerCommand.includes('లాగిన్') || lowerCommand.includes('ప్రవేశించండి')) {
      speak(t('login'));
    }
    else if (lowerCommand.includes('donor') || lowerCommand.includes('దాత') || lowerCommand.includes('దానం చేసేవాడు')) {
      speak(t('donor'));
      localStorage.setItem('selectedRole', 'donor');
      setTimeout(() => navigate('/AuthForm'), 1000);
    }
    else if (lowerCommand.includes('helper') || lowerCommand.includes('service') || lowerCommand.includes('volunteer') || lowerCommand.includes('సహాయకుడు') || lowerCommand.includes('స్వచ్చంద')) {
      speak(t('helper'));
      localStorage.setItem('selectedRole', 'helper');
      setTimeout(() => navigate('/AuthForm'), 1000);
    }
    else if (lowerCommand.includes('receiver') || lowerCommand.includes('రిసీవర్') || lowerCommand.includes('పొందేవాడు')) {
      speak(t('receiver'));
      localStorage.setItem('selectedRole', 'receiver');
      setTimeout(() => navigate('/AuthForm'), 1000);
    }
    else if (lowerCommand.includes('organization') || lowerCommand.includes('ngo') || lowerCommand.includes('సంస్థ') || lowerCommand.includes('సంఘం')) {
      speak(t('organization'));
      localStorage.setItem('selectedRole', 'organization');
      setTimeout(() => navigate('/AuthForm'), 1000);
    }
    else if (lowerCommand.includes('admin') || lowerCommand.includes('నిర్వాహకుడు') || lowerCommand.includes('అడ్మిన్')) {
      speak(t('admin'));
      localStorage.setItem('selectedRole', 'admin');
      setTimeout(() => navigate('/AuthForm'), 1000);
    }
    
    // Campaign queries
    else if (lowerCommand.includes('campaign') || lowerCommand.includes('donate') || lowerCommand.includes('fundraiser') || lowerCommand.includes('క్యాంపెయిన్') || lowerCommand.includes('దానం')) {
      fetchCampaignInfo(lowerCommand);
    }
    else if (lowerCommand.includes('create campaign') || lowerCommand.includes('start campaign') || lowerCommand.includes('క్యాంపెయిన్ సృష్టించండి') || lowerCommand.includes('క్యాంపెయిన్ మొదలుపెట్టండి')) {
      speak(t('createCampaign'));
      localStorage.setItem('selectedRole', 'donor');
      setTimeout(() => navigate('/AuthForm'), 1000);
    }
    
    // Help and information
    else if (lowerCommand.includes('what can you do') || lowerCommand.includes('help') || lowerCommand.includes('capabilities') || lowerCommand.includes('మీరు ఏమి చేయగలరు') || lowerCommand.includes('సహాయం')) {
      speak(t('capabilities'));
    }
    else if (lowerCommand.includes('how to donate') || lowerCommand.includes('make donation') || lowerCommand.includes('donation process') || lowerCommand.includes('దానం ఎలా చేయాలి') || lowerCommand.includes('దానం చేయడం ఎలా')) {
      speak(t('howToDonate'));
    }
    else if (lowerCommand.includes('how to help') || lowerCommand.includes('volunteer') || lowerCommand.includes('offer help') || lowerCommand.includes('సహాయం ఎలా చేయాలి') || lowerCommand.includes('స్వచ్ఛందంగా ఎలా సహాయపడాలి')) {
      speak(t('howToHelp'));
    }
    else if (lowerCommand.includes('impact stories') || lowerCommand.includes('success stories') || lowerCommand.includes('stories') || lowerCommand.includes('ప్రభావం కథనాలు') || lowerCommand.includes('విజయ కథలు')) {
      speak(t('impactStories'));
      setTimeout(() => navigate('/impact-stories'), 1000);
    }
    
    // Account information
    else if (lowerCommand.includes('my account') || lowerCommand.includes('profile') || lowerCommand.includes('my profile') || lowerCommand.includes('నా ఖాతా') || lowerCommand.includes('నా ప్రొఫైల్')) {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (user) {
        speak(`You are logged in as ${user.name || user.username}, a ${user.role}. Your trust score is ${user.trustScore || 50}.`);
      } else {
        speak(t('notLoggedIn'));
      }
    }
    
    // Navigation controls
    else if (lowerCommand.includes('back') || lowerCommand.includes('go back') || lowerCommand.includes('వెనక్కి') || lowerCommand.includes('బ్యాక్')) {
      speak('Going back');
      setTimeout(() => window.history.back(), 500);
    }
    else if (lowerCommand.includes('scroll down') || lowerCommand.includes('కిందికి స్క్రోల్ చేయండి')) {
      window.scrollBy({ top: 600, behavior: 'smooth' });
      speak('Scrolling down');
    }
    else if (lowerCommand.includes('scroll up') || lowerCommand.includes('పైకి స్క్రోల్ చేయండి')) {
      window.scrollBy({ top: -600, behavior: 'smooth' });
      speak('Scrolling up');
    }
    else if (lowerCommand.includes('refresh') || lowerCommand.includes('reload') || lowerCommand.includes('రిఫ్రెష్') || lowerCommand.includes('తాజాకరించండి')) {
      speak('Refreshing page');
      setTimeout(() => window.location.reload(), 500);
    }
    
    // Greetings and basic conversation
    else if (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('hey') || lowerCommand.includes('నమస్కారం') || lowerCommand.includes('హలో')) {
      speak(t('welcome'));
    }
    else if (lowerCommand.includes('thank') || lowerCommand.includes('thanks') || lowerCommand.includes('ధన్యవాదాలు') || lowerCommand.includes('థాంక్యూ')) {
      speak('You are welcome! Is there anything else I can help you with?');
    }
    else if (lowerCommand.includes('bye') || lowerCommand.includes('goodbye') || lowerCommand.includes('exit') || lowerCommand.includes('వీడ్కోలు') || lowerCommand.includes('బై')) {
      speak(t('goodbye'));
      setTimeout(() => setIsOpen(false), 1500);
    }
    
    // Default response
    else {
      speak(t('notUnderstood'));
    }
  };

  // Fetch campaign information
  const fetchCampaignInfo = async (query) => {
    try {
      // Mock data for demonstration
      const mockCampaigns = {
        success: true,
        data: [
          { id: 1, title: "Medical Aid for Rural Areas", category: "medical" },
          { id: 2, title: "Education for Underprivileged", category: "education" },
          { id: 3, title: "Disaster Relief Fund", category: "disaster" }
        ]
      };

      const data = mockCampaigns;
      
      if (data.success && data.data && data.data.length > 0) {
        speak(t('campaigns'));
      } else {
        speak('No active campaigns found at the moment. Please check back later or create a new campaign.');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      speak('Sorry, I could not fetch campaign information right now. Please try again later.');
    }
  };

  // Open assistant with greeting
  const handleOpen = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsOpen(true);
    
    setTimeout(() => {
      if (conversationHistory.length === 0) {
        speak(t('welcome'));
      }
    }, 500);
  };

  // Close assistant
  const handleClose = () => {
    stopListening();
    window.speechSynthesis.cancel();
    setIsOpen(false);
    setTimeout(() => {
      setConversationHistory([]);
      setCapturedText('');
      setLiveText('');
      setResponse('');
    }, 300);
  };

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    const conversationContainer = document.querySelector('[data-conversation-container]');
    if (conversationContainer) {
      conversationContainer.scrollTop = conversationContainer.scrollHeight;
    }
  }, [conversationHistory, liveText]);

  return (
    <>
      {/* Floating Assistant Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            zIndex: 9998,
            transition: 'all 0.3s ease',
            animation: 'pulse 2s infinite'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.7)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.5)';
          }}
          title="Voice Assistant"
        >
          🎤
        </button>
      )}

      {/* Voice Assistant Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '400px',
          height: '550px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '15px 20px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                🤖 Voice Assistant
              </h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                {isListening ? t('listening') : isSpeaking ? t('speaking') : 'Ready to help'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Language Selector */}
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '5px 8px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                  maxWidth: '120px'
                }}
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Conversation History */}
          <div 
            data-conversation-container
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              background: '#f7fafc'
            }}
          >
            {conversationHistory.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#a0aec0', marginTop: '40px' }}>
                <div style={{ fontSize: '48px', margin: '0 0 10px 0' }}>🎤</div>
                <p style={{ margin: '0 0 20px 0' }}>Press the microphone button to start speaking</p>
                <div style={{ 
                  background: 'white', 
                  padding: '15px', 
                  borderRadius: '12px', 
                  marginTop: '20px',
                  fontSize: '13px',
                  textAlign: 'left',
                  color: '#4a5568',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <strong>Try saying:</strong>
                  <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                    <li>"What can you do?"</li>
                    <li>"Show me campaigns"</li>
                    <li>"Login as donor"</li>
                    <li>"Change language to Telugu"</li>
                    <li>"Go to home page"</li>
                  </ul>
                </div>
              </div>
            ) : (
              conversationHistory.map((msg, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.role === 'user' ? '#667eea' : 'white',
                    color: msg.role === 'user' ? 'white' : '#2d3748',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '4px', opacity: 0.8 }}>
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    {msg.message}
                    <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Live Transcription */}
          {(isListening || liveText) && (
            <div style={{
              padding: '12px 20px',
              background: '#ebf8ff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4299e1',
                animation: 'pulse 1.5s infinite'
              }} />
              <span style={{ fontSize: '13px', color: '#4a5568', flex: 1 }}>
                {liveText || t('listening')}
              </span>
            </div>
          )}

          {/* Status Bar */}
          {(isSpeaking || isProcessing) && (
            <div style={{
              padding: '8px 20px',
              background: isSpeaking ? '#f0fff4' : '#fffaf0',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: '#4a5568'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isSpeaking ? '#48bb78' : '#ed8936',
                animation: 'blink 1s infinite'
              }} />
              {isSpeaking ? t('speaking') : t('processing')}
            </div>
          )}

          {/* Controls */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid #e2e8f0',
            background: 'white'
          }}>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking || isProcessing}
                style={{
                  flex: 1,
                  padding: '15px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isListening 
                    ? 'linear-gradient(135deg, #f56565 0%, #c53030 100%)'
                    : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: (isSpeaking || isProcessing) ? 'not-allowed' : 'pointer',
                  opacity: (isSpeaking || isProcessing) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isListening ? (
                  <>
                    <span style={{ fontSize: '20px' }}>⏹️</span>
                    Stop
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '20px' }}>🎤</span>
                    Speak
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }}
                disabled={!isSpeaking}
                style={{
                  padding: '15px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#e2e8f0',
                  color: '#4a5568',
                  fontSize: '16px',
                  cursor: isSpeaking ? 'pointer' : 'not-allowed',
                  opacity: isSpeaking ? 1 : 0.5,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  minWidth: '50px'
                }}
                title="Stop Speaking"
              >
                🔇
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
          }
          50% {
            transform: scale(1.05);
            boxShadow: 0 4px 30px rgba(102, 126, 234, 0.8);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </>
  );
}