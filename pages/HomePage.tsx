
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MbtiResult, QnAStep, QnAHistoryItem, Language } from '../types';
import { processSelfDescription, startOrContinueQnA, getAnalysisFromQnA } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { SparklesIcon, LightBulbIcon, PencilSquareIcon, ChatBubbleLeftRightIcon, CubeTransparentIcon, BriefcaseIcon, UsersIcon } from '../components/icons/HeroIcons';
import { SUPPORTED_LANGUAGES } from '../constants';

interface HomePageProps {
  setLatestResult: (result: MbtiResult | null) => void;
}

type TestMode = 'description' | 'qna' | 'hybrid';
type ViewState = 'selection' | 'descriptionInput' | 'hybridInput' | 'qnaLanguageSelection' | 'qnaInProgress' | 'finalizing';

const QNA_SOFT_LIMIT = 25; // At this point, we encourage the AI to finish
const QNA_HARD_LIMIT = 35; // At this point, we force the AI to finish

const HomePage: React.FC<HomePageProps> = ({ setLatestResult }) => {
  const [description, setDescription] = useState('');
  const [hybridInitialDescription, setHybridInitialDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [currentTestMode, setCurrentTestMode] = useState<TestMode | null>(null);
  const [viewState, setViewState] = useState<ViewState>('selection');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en'); 

  const [qnaStep, setQnAStep] = useState<QnAStep | null>(null);
  const [qnaHistory, setQnAHistory] = useState<QnAHistoryItem[]>([]);

  const resetState = (keepError: boolean = false) => {
    setDescription('');
    setHybridInitialDescription('');
    setIsLoading(false);
    if (!keepError) setError(null);
    setCurrentTestMode(null);
    setViewState('selection');
    setQnAStep(null);
    setQnAHistory([]);
  };
  
  const checkApiKey = () : boolean => {
    if (!process.env.API_KEY) {
      setError("Gemini API Key is not configured. AI features are disabled. Please contact support or check configuration.");
      setIsLoading(false);
      resetState(true); 
      return false;
    }
    return true;
  }

  const handleModeSelection = (mode: TestMode) => {
    if (!checkApiKey()) return;
    resetState(); 
    setCurrentTestMode(mode);
    if (mode === 'description') {
      setViewState('descriptionInput');
    } else if (mode === 'hybrid') {
      setViewState('hybridInput');
    } else if (mode === 'qna') {
      setViewState('qnaLanguageSelection'); 
    }
  };

  const handleLanguageSelectedForQnA = (langCode: string) => {
    setSelectedLanguage(langCode);
    setViewState('qnaInProgress');
    initiateQnA(langCode, undefined); 
  }

  const initiateQnA = async (langCode: string, initialText?: string) => {
    if (!checkApiKey()) return;
    setIsLoading(true);
    setError(null);
    setQnAHistory([]); 
    try {
      const firstStep = await startOrContinueQnA(langCode, initialText, [], false);
      setQnAStep(firstStep);
      setViewState('qnaInProgress');
    } catch (err) {
      console.error("Error initiating Q&A:", err);
      setError(err instanceof Error ? err.message : 'Failed to start Q&A. Please try again.');
      setViewState('selection'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!checkApiKey()) return;
    if (!description.trim()) {
      setError('Please describe yourself before submitting.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await processSelfDescription(description, selectedLanguage); 
      setLatestResult(result);
      navigate('/results');
    } catch (err) {
      console.error("Error processing description:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHybridInitialSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!checkApiKey()) return;
    if (!hybridInitialDescription.trim()) {
      setError('Please provide a brief description to start.');
      return;
    }
    initiateQnA(selectedLanguage, hybridInitialDescription);
  };

  const handleQnAAnswer = async (answer: string) => {
    if (!qnaStep || !checkApiKey()) return;

    const newHistoryItem: QnAHistoryItem = { question: qnaStep.question, answer: answer, choices: qnaStep.choices };
    const updatedHistory = [...qnaHistory, newHistoryItem];
    setQnAHistory(updatedHistory);
    
    setIsLoading(true);
    setError(null);

    // Hard limit fail-safe
    if (updatedHistory.length >= QNA_HARD_LIMIT) {
      try {
        setViewState('finalizing');
        const finalResult = await getAnalysisFromQnA(
          selectedLanguage, 
          currentTestMode === 'hybrid' ? hybridInitialDescription : undefined,
          updatedHistory
        );
        setLatestResult(finalResult); 
        navigate('/results');
      } catch (err) {
         console.error("Error in Q&A step (at hard limit):", err);
         setError(err instanceof Error ? err.message : 'An error occurred during final analysis. Please try again or restart.');
      } finally {
          setIsLoading(false);
      }
      return; // Stop execution here
    }
    
    const isPastSoftLimit = updatedHistory.length >= QNA_SOFT_LIMIT;

    try {
      const nextStep = await startOrContinueQnA(
        selectedLanguage, 
        currentTestMode === 'hybrid' ? hybridInitialDescription : undefined,
        updatedHistory,
        isPastSoftLimit
      );
      setQnAStep(nextStep);
      if (nextStep.isFinal) {
        setViewState('finalizing');
        const finalResult = await getAnalysisFromQnA(
          selectedLanguage, 
          currentTestMode === 'hybrid' ? hybridInitialDescription : undefined,
          updatedHistory
        );
        setLatestResult(finalResult); 
        navigate('/results');
      }
    } catch (err) {
      console.error("Error in Q&A step:", err);
      setError(err instanceof Error ? err.message : 'An error occurred during Q&A. Please try again or restart.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectionView = () => (
    <section className="mt-12 p-6 md:p-8 bg-bground-light rounded-xl shadow-2xl animate-fade-in border border-neutral/20">
      <h2 className="text-3xl lg:text-4xl font-display font-bold text-center mb-10 text-primary">Choose Your Path to Self-Discovery</h2>
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <ModeCard
          icon={<PencilSquareIcon className="w-12 h-12 text-pink-500" />}
          title="Classic Description"
          description="Pour out your thoughts, habits, and passions. Our AI will analyze your narrative."
          onClick={() => handleModeSelection('description')}
          buttonText="Start with Description"
          buttonClass="bg-pink-600 hover:bg-pink-700"
        />
        <ModeCard
          icon={<ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-500" />}
          title="Dynamic Q&A"
          description="Answer AI-generated multiple-choice questions that adapt to your responses for a deep dive."
          onClick={() => handleModeSelection('qna')}
          buttonText="Start Q&A"
          buttonClass="bg-blue-600 hover:bg-blue-700"
        />
        <ModeCard
          icon={<CubeTransparentIcon className="w-12 h-12 text-yellow-500" />}
          title="Hybrid Analysis"
          description="Briefly describe yourself, then engage in a personalized Q&A for comprehensive insights."
          onClick={() => handleModeSelection('hybrid')}
          buttonText="Start Hybrid Analysis"
          buttonClass="bg-accent hover:bg-yellow-500 text-bground font-bold shadow-lg hover:shadow-yellow-500/50"
          recommended
        />
      </div>
      {error && <p className="text-red-400 text-center text-sm mt-6 animate-fade-in">{error}</p>}
    </section>
  );

  const renderLanguageSelectionView = () => (
    <section className="glassmorphism p-6 sm:p-10 rounded-xl shadow-xl animate-fade-in max-w-lg mx-auto">
        <button onClick={() => setViewState('selection')} className="mb-6 text-sm text-accent hover:text-yellow-300">&larr; Back to modes</button>
        <h2 className="text-2xl font-display font-semibold text-center mb-6 text-content">Select Your Language</h2>
        <p className="text-center text-content-muted mb-6">Choose the language for your Q&A session.</p>
        <div className="space-y-4">
            <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-3 bg-bground-light border border-neutral/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-lg text-content dark-theme-options"
            >
                {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="bg-bground-light text-content">{lang.name}</option>
                ))}
            </select>
            <button
                onClick={() => handleLanguageSelectedForQnA(selectedLanguage)}
                className="w-full bg-primary hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
            >
                Start Q&A in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage}
            </button>
        </div>
        {error && <p className="text-red-400 text-center text-sm mt-4">{error}</p>}
    </section>
);


  const renderDescriptionInputView = () => (
    <section className="glassmorphism p-6 sm:p-10 rounded-xl shadow-xl animate-fade-in max-w-2xl mx-auto">
      <button onClick={() => resetState()} className="mb-4 text-sm text-accent hover:text-yellow-300">&larr; Choose another method</button>
      <form onSubmit={handleDescriptionSubmit} className="space-y-8">
        <div>
           <label htmlFor="languageSelectDescription" className="block text-sm font-medium text-content-muted mb-1">Response Language:</label>
            <select 
                id="languageSelectDescription"
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-3 mb-4 bg-bground-light border border-neutral/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-content dark-theme-options"
            >
                {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="bg-bground-light text-content">{lang.name}</option>
                ))}
            </select>
          <label htmlFor="selfDescription" className="flex items-center space-x-2 text-2xl font-display font-semibold mb-4 text-content">
            <LightBulbIcon className="w-8 h-8 text-primary"/>
            <span>Tell Us About Yourself</span>
          </label>
          <textarea
            id="selfDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., I'm a quiet person who enjoys reading and coding. I love structured environments but also appreciate creative problem-solving..."
            rows={10}
            className="w-full p-5 bg-bground-light/50 border border-neutral/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-lg placeholder-content-muted/70 text-content"
            disabled={isLoading}
          />
          <p className="text-xs text-content-muted mt-2">The more detail you provide, the more accurate your insights will be. The AI will respond in your selected language above.</p>
        </div>
        {error && <p className="text-red-400 text-center text-sm animate-fade-in">{error}</p>}
        {isLoading ? (
          <LoadingSpinner text="Analyzing your essence..." />
        ) : (
          <button
            type="submit"
            disabled={isLoading || !description.trim()}
            className="w-full bg-gradient-to-r from-primary via-pink-500 to-accent hover:opacity-90 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-xl hover:shadow-primary/50 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center space-x-3"
          >
            <SparklesIcon className="w-6 h-6" />
            <span>Reveal My Personality</span>
          </button>
        )}
      </form>
    </section>
  );

  const renderHybridInputView = () => (
     <section className="glassmorphism p-6 sm:p-10 rounded-xl shadow-xl animate-fade-in max-w-2xl mx-auto">
      <button onClick={() => resetState()} className="mb-4 text-sm text-accent hover:text-yellow-300">&larr; Choose another method</button>
      <form onSubmit={handleHybridInitialSubmit} className="space-y-8">
         <div>
            <label htmlFor="languageSelectHybrid" className="block text-sm font-medium text-content-muted mb-1">Primary Language for Q&A:</label>
            <select 
                id="languageSelectHybrid"
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-3 mb-4 bg-bground-light border border-neutral/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-content dark-theme-options"
            >
                {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="bg-bground-light text-content">{lang.name}</option>
                ))}
            </select>
          <label htmlFor="hybridInitialDescription" className="flex items-center space-x-2 text-2xl font-display font-semibold mb-4 text-content">
            <LightBulbIcon className="w-8 h-8 text-accent"/>
            <span>Start with a Brief Summary</span>
          </label>
          <textarea
            id="hybridInitialDescription"
            value={hybridInitialDescription}
            onChange={(e) => setHybridInitialDescription(e.target.value)}
            placeholder="E.g., I'm an outgoing person who loves new experiences... (AI will try to match this language for Q&A if it differs from selection above, otherwise use selected language)"
            rows={4}
            className="w-full p-5 bg-bground-light/50 border border-neutral/30 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-lg placeholder-content-muted/70 text-content"
            disabled={isLoading}
          />
          <p className="text-xs text-content-muted mt-2">This helps AI tailor questions. AI will try to use the language of this description if it's clear and specific, otherwise it will use your selected language above for the Q&A.</p>
        </div>
        {error && <p className="text-red-400 text-center text-sm animate-fade-in">{error}</p>}
        {isLoading ? (
          <LoadingSpinner text="Preparing your Q&A..." />
        ) : (
          <button
            type="submit"
            disabled={isLoading || !hybridInitialDescription.trim()}
            className="w-full bg-gradient-to-r from-accent via-yellow-500 to-secondary hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-xl hover:shadow-accent/50 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <span>Continue to Personalized Q&A</span>
          </button>
        )}
      </form>
    </section>
  );

  const renderQnAInProgressView = () => {
    if (isLoading && !qnaStep) {
        return <LoadingSpinner text="Loading first question..." />;
    }
    if (!qnaStep) {
        return <p className="text-center text-content-muted">Preparing questions...</p>;
    }
    const progress = qnaHistory.length > 0 ? Math.min(98, (qnaHistory.length / QNA_HARD_LIMIT) * 100) : 2; 
    const isPastSoft = qnaHistory.length >= QNA_SOFT_LIMIT;

    return (
      <section className="glassmorphism p-6 sm:p-10 rounded-xl shadow-xl animate-fade-in space-y-8 max-w-2xl mx-auto">
        <button onClick={() => resetState()} className="mb-2 text-sm text-accent hover:text-yellow-300">&larr; Restart Test</button>
        <div>
            <div className="w-full bg-neutral/30 rounded-full h-3 mb-2">
                <div className="bg-gradient-to-r from-pink-500 to-primary h-3 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
            </div>
            <p className="text-sm text-content-muted text-center mb-6">
                Question {qnaHistory.length + 1} | 
                {isPastSoft 
                    ? <span className="text-accent font-semibold"> Finalizing analysis...</span> 
                    : ` Est. ~15 questions (Max ${QNA_HARD_LIMIT})`
                } | Language: {SUPPORTED_LANGUAGES.find(l=>l.code === selectedLanguage)?.name || selectedLanguage}
            </p>
        </div>
        <h2 className="text-2xl font-display font-semibold text-content mb-6 text-center">{qnaStep.question}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {qnaStep.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => handleQnAAnswer(choice)}
              disabled={isLoading}
              className="p-4 bg-bground-light hover:bg-secondary/70 border border-neutral/20 hover:border-secondary rounded-lg text-left transition-all duration-200 disabled:opacity-60 disabled:cursor-wait text-content hover:text-white shadow-md hover:shadow-lg"
            >
              {choice}
            </button>
          ))}
        </div>
        {isLoading && <LoadingSpinner text="Getting next question..." />}
        {error && <p className="text-red-400 text-center text-sm animate-fade-in mt-4">{error}</p>}
      </section>
    );
  };
  
  const renderFinalizingView = () => (
    <LoadingSpinner text="Finalizing your comprehensive analysis..." />
  );


  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <section className="text-center pt-12 pb-16 bg-gradient-to-br from-primary/30 via-bground to-bground/80 rounded-xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            {/* Decorative background elements could go here if desired */}
        </div>
        <SparklesIcon className="w-20 h-20 text-accent mx-auto mb-6 animate-pulse" />
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight text-shadow-accent-glow">
          Unlock Your <span className="text-primary text-shadow-primary-glow">Inner Code</span>
        </h1>
        <p className="text-xl text-content-muted max-w-3xl mx-auto mb-10">
          Choose your preferred method to explore your personality. Our AI will guide you to insights for growth, career, and self-discovery.
        </p>
      </section>

      {viewState === 'selection' && renderSelectionView()}
      {viewState === 'descriptionInput' && renderDescriptionInputView()}
      {viewState === 'hybridInput' && renderHybridInputView()}
      {viewState === 'qnaLanguageSelection' && renderLanguageSelectionView()}
      {viewState === 'qnaInProgress' && renderQnAInProgressView()}
      {viewState === 'finalizing' && renderFinalizingView()}

      {viewState === 'selection' && (
         <>
            <section className="mt-16 p-8 bg-bground-light rounded-xl shadow-2xl border border-neutral/20">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-center mb-10 text-secondary">Why This Matters</h2>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <InfoPillar icon={<LightBulbIcon className="text-accent w-10 h-10"/>} title="Understand Yourself" description="Gain deeper clarity on your motivations, strengths, and areas for growth."/>
                <InfoPillar icon={<BriefcaseIcon className="text-accent w-10 h-10"/>} title="Find Your Path" description="Discover career and educational directions that align with your true nature."/>
                <InfoPillar icon={<UsersIcon className="text-accent w-10 h-10"/>} title="Improve Relationships" description="Learn how your personality impacts interactions and build stronger connections."/>
              </div>
            </section>
            <FaqSection />
         </>
      )}
    </div>
  );
};

interface ModeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  buttonText: string;
  buttonClass: string;
  recommended?: boolean;
}

const ModeCard: React.FC<ModeCardProps> = ({ icon, title, description, onClick, buttonText, buttonClass, recommended }) => (
  <div className={`p-6 bg-bground rounded-lg shadow-xl hover:shadow-primary/40 transition-all duration-300 flex flex-col items-center relative transform hover:-translate-y-1 ${recommended ? 'ring-4 ring-accent shadow-accent/30' : 'ring-1 ring-neutral/20'}`}>
    {recommended && <span className="absolute -top-3.5 -right-3.5 bg-accent text-bground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform rotate-6">RECOMMENDED</span>}
    <div className="mb-4 text-accent">{icon}</div>
    <h3 className="text-xl font-display font-semibold mb-3 text-content">{title}</h3>
    <p className="text-content-muted text-sm mb-6 flex-grow">{description}</p>
    <button
      onClick={onClick}
      className={`w-full mt-auto ${buttonClass} text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-base`}
    >
      {buttonText}
    </button>
  </div>
);

interface InfoPillarProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}
const InfoPillar: React.FC<InfoPillarProps> = ({icon, title, description}) => (
    <div className="p-6 bg-bground rounded-lg shadow-lg hover:shadow-secondary/30 transition-shadow duration-300">
        <div className="flex justify-center mb-3">{icon}</div>
        <h3 className="text-xl font-display font-semibold mb-2 text-content">{title}</h3>
        <p className="text-content-muted text-sm">{description}</p>
    </div>
);

const faqData = [
  {
    q: "What is the MBTI?",
    a: "The Myers-Briggs Type Indicator (MBTI) is an introspective self-report questionnaire indicating differing psychological preferences in how people perceive the world and make decisions. It categorizes personalities into 16 types based on four dichotomies: Introversion (I) or Extraversion (E), Sensing (S) or Intuition (N), Thinking (T) or Feeling (F), and Judging (J) or Perceiving (P)."
  },
  {
    q: "What does -A / -T (Assertive / Turbulent) mean?",
    a: "This is an additional layer on top of the classic MBTI types that describes how you respond to life's challenges. Assertive (-A) individuals are typically self-assured, even-tempered, and resistant to stress. Turbulent (-T) individuals are more self-conscious, sensitive to stress, and driven by a desire for improvement."
  },
  {
    q: "How does this AI test work?",
    a: "This application uses a powerful AI model (Google's Gemini) to analyze your personality. In 'Description' mode, it reads your self-description. In 'Q&A' mode, it asks a series of adaptive questions. The AI then identifies patterns related to the MBTI dichotomies and the A/T identity to generate your personalized report."
  },
  {
    q: "Is this test scientifically validated?",
    a: "While the MBTI is widely used for personal development, its scientific validity and reliability are debated in academic psychology. This AI-powered test is an interpretation based on your input and should be used for entertainment, self-reflection, and exploration, not as a clinical diagnosis or a substitute for professional advice."
  },
  {
    q: "What are the 'Map of Consciousness' and 'New Age' concepts?",
    a: "These are additional frameworks for growth. David Hawkins' Map of Consciousness is a model that links emotional states to levels of awareness, providing a roadmap for spiritual growth. 'New Age' concepts refer to various modern spiritual practices like mindfulness, manifestation, and energy work that can complement your self-development journey. This app integrates them to provide deeper, more holistic insights."
  }
];

const FaqItem: React.FC<{ q: string; a: string; }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="py-5 border-b border-neutral/20 last:border-b-0">
      <button onClick={() => setIsOpen(!isOpen)} className="flex justify-between items-center w-full text-left" aria-expanded={isOpen}>
        <h4 className="text-lg font-semibold text-content">{q}</h4>
        <svg className={`w-6 h-6 text-accent transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        <div className="mt-4 text-content-muted animate-fade-in prose prose-sm max-w-none">
          <p>{a}</p>
        </div>
      )}
    </div>
  );
};

const FaqSection: React.FC = () => (
  <section className="mt-16 p-8 bg-bground-light rounded-xl shadow-2xl border border-neutral/20">
    <h2 className="text-3xl lg:text-4xl font-display font-bold text-center mb-10 text-secondary">Frequently Asked Questions</h2>
    <div className="max-w-3xl mx-auto">
      {faqData.map((faq, index) => (
        <FaqItem key={index} q={faq.q} a={faq.a} />
      ))}
    </div>
  </section>
);


export default HomePage;
