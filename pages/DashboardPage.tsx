
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MbtiResult, FeedItem, User } from '../types';
import { LOCAL_STORAGE_HISTORY_KEY, SUPPORTED_LANGUAGES } from '../constants';
import { BookOpenIcon, BriefcaseIcon, LightBulbIcon, SparklesIcon, UsersIcon, ArrowPathIcon, SunIcon, ChartBarIcon, PrinterIcon, ClipboardDocumentIcon } from '../components/icons/HeroIcons';
import { Link, useNavigate } from 'react-router-dom';
import { getDetailedMbtiExploration, getDevelopmentStrategies } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { marked } from 'https://esm.sh/marked@^12.0.2';


interface DashboardPageProps {
  latestResult: MbtiResult | null; 
}

interface ModalContentType {
  title: string;
  htmlContent: string;
  textContent: string; // Added for copying
}

const DashboardPage: React.FC<DashboardPageProps> = ({ latestResult }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [testHistory, setTestHistory] = useState<MbtiResult[]>([]);
  const [personalizedFeed, setPersonalizedFeed] = useState<FeedItem[]>([]);
  const [selectedResultForFeed, setSelectedResultForFeed] = useState<MbtiResult | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContentType | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);

  const printableDashboardContentRef = useRef<HTMLDivElement>(null);


  const loadUserHistory = useCallback(() => {
    if (currentUser) {
      const historyString = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (historyString) {
        try {
          const allHistory: { user: User, results: MbtiResult[] }[] = JSON.parse(historyString);
          const userHistoryEntry = allHistory.find(entry => entry.user.uid === currentUser.uid);
          if (userHistoryEntry && userHistoryEntry.results) {
            const sortedResults = [...userHistoryEntry.results].sort((a, b) => 
              (b.timestamp && a.timestamp) ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() : 0
            ).map(r => ({ ...r, language: r.language || 'en' })); 
            setTestHistory(sortedResults);
            const resultToSelect = latestResult 
                ? { ...(latestResult), language: latestResult.language || 'en' } 
                : (sortedResults.length > 0 ? sortedResults[0] : null);
            setSelectedResultForFeed(resultToSelect);
            return sortedResults;
          }
        } catch (e) {
          console.error("Failed to parse history from localStorage", e);
          localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
        }
      }
      if (latestResult) {
         setSelectedResultForFeed({ ...(latestResult), language: latestResult.language || 'en' });
      } else {
        setSelectedResultForFeed(null); 
      }
    }
    return [];
  }, [currentUser, latestResult]);

  useEffect(() => {
    loadUserHistory();
  }, [loadUserHistory]);


  const generatePersonalizedFeed = useCallback((currentProfileForFeed: MbtiResult | null) => {
    if (currentProfileForFeed) {
      const fullMbtiType = `${currentProfileForFeed.mbtiType}-${currentProfileForFeed.identity}`;
      const langName = SUPPORTED_LANGUAGES.find(l => l.code === currentProfileForFeed.language)?.name || currentProfileForFeed.language;
      const feed: FeedItem[] = [
        {
          id: 'mbti-deep-dive',
          title: `Explore Your ${fullMbtiType} Traits`,
          description: `Delve deeper into the nuances of the ${fullMbtiType} (in ${langName}). Understand cognitive functions, common patterns, and more.`,
          category: 'MBTI Deep Dive',
          icon: <BookOpenIcon className="w-8 h-8 text-pink-500" />,
          actionText: 'Learn More',
          actionType: 'mbtiExploration',
        },
        {
          id: 'develop-potential',
          title: 'Develop Untapped Potential',
          description: `Every ${fullMbtiType} has areas they can develop further. Get personalized strategies (in ${langName}) that consider your Assertive/Turbulent nature.`,
          category: 'Talent Discovery',
          icon: <UsersIcon className="w-8 h-8 text-yellow-500" />,
          actionText: 'Explore Development Strategies',
          actionType: 'developmentStrategies',
        },
        {
          id: 'career-alignment',
          title: 'Align Career with Your Strengths',
          description: `Review career paths like "${currentProfileForFeed.careerSuggestions[0] || 'suggested fields'}" and explore how your type thrives professionally.`,
          category: 'Potential Development',
          icon: <BriefcaseIcon className="w-8 h-8 text-blue-500" />,
        },
        {
          id: 'growth-mindset',
          title: `Cultivate a ${currentProfileForFeed.identity === 'A' ? 'Confident' : 'Resilient'} Mindset`,
          description: `Embrace challenges as opportunities. Your ${fullMbtiType} type has unique ways to grow; let's explore them.`,
          category: 'Self-Improvement',
          icon: <LightBulbIcon className="w-8 h-8 text-green-500" />,
        },
        {
          id: 'hawkins-reflection',
          title: 'Reflect on Consciousness',
          description: currentProfileForFeed.consciousnessLevelPrediction 
            ? `Your results indicated: "${currentProfileForFeed.consciousnessLevelPrediction}". Reflect on this insight for growth.`
            : `Consider: "${currentProfileForFeed.hawkinsInsight}". How does this resonate with your current level of awareness?`,
          category: 'Self-Improvement',
          icon: <ChartBarIcon className="w-8 h-8 text-teal-500" />,
        },
         {
          id: 'new-age-practice',
          title: 'Integrate New Age Wisdom',
          description: currentProfileForFeed.detailedNewAgeSuggestions && currentProfileForFeed.detailedNewAgeSuggestions.length > 0
            ? `Try this: "${currentProfileForFeed.detailedNewAgeSuggestions[0]}". Explore how it impacts your well-being.`
            : `Explore: "${currentProfileForFeed.newAgeConcept}". Simple practices can bring this concept into your daily life.`,
          category: 'Balanced Living',
          icon: <SunIcon className="w-8 h-8 text-orange-500" />,
        },
      ];
      setPersonalizedFeed(feed);
    } else {
         setPersonalizedFeed([ 
            { id: '1', title: 'Welcome to Your Dashboard!', description: 'Take a test to get personalized insights and populate your feed.', category: 'Self-Improvement', icon: <SparklesIcon className="w-8 h-8 text-accent"/>, actionText:"Take a Test Now", actionLink:"/" },
            { id: '2', title: 'Discover Your Potential', description: 'Our AI helps you understand yourself better through various assessment methods.', category: 'Potential Development', icon: <LightBulbIcon className="w-8 h-8 text-secondary"/> },
        ]);
    }
  }, []);

  useEffect(() => {
    generatePersonalizedFeed(selectedResultForFeed);
  }, [selectedResultForFeed, generatePersonalizedFeed]);


  const handleSelectResultForFeed = (result: MbtiResult) => {
    setSelectedResultForFeed({...result, language: result.language || 'en'}); 
  };
  
  const viewFullReport = (result: MbtiResult) => {
    (window as any).latestResultForNav = result;
    navigate('/results', { state: { resultDataFromDashboard: result }});
  };

  const updateStoredHistory = (updatedResult: MbtiResult) => {
    if (!currentUser) return;

    const currentHistoryString = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    let allUserHistories: { user: User, results: MbtiResult[] }[] = currentHistoryString ? JSON.parse(currentHistoryString) : [];
    
    const userHistoryIndex = allUserHistories.findIndex(entry => entry.user.uid === currentUser.uid);

    if (userHistoryIndex > -1) {
        const specificUserHistory = allUserHistories[userHistoryIndex].results;
        const resultIndex = specificUserHistory.findIndex(r => r.timestamp === updatedResult.timestamp && r.language === updatedResult.language); 
        if (resultIndex > -1) {
            specificUserHistory[resultIndex] = updatedResult;
        } else {
            const tsIndex = specificUserHistory.findIndex(r => r.timestamp === updatedResult.timestamp);
            if(tsIndex > -1) specificUserHistory[tsIndex] = updatedResult;
            else specificUserHistory.unshift(updatedResult); 
        }
        allUserHistories[userHistoryIndex].results = specificUserHistory;
    } else {
        allUserHistories.push({ user: currentUser, results: [updatedResult] });
    }
    
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(allUserHistories));
    setTestHistory(loadUserHistory()); 
  };

  const handleFeedActionClick = async (actionType: 'mbtiExploration' | 'developmentStrategies') => {
    if (!selectedResultForFeed || !process.env.API_KEY) {
      setModalError(process.env.API_KEY ? "No result selected to explore." : "API Key not configured. This feature is unavailable.");
      setIsModalOpen(true);
      return;
    }

    const languageForResult = selectedResultForFeed.language || 'en'; 

    setModalError(null);
    setIsModalLoading(true);
    setIsModalOpen(true);
    setCopySuccessMessage(null);

    try {
      let rawContent: string | undefined; // Raw Markdown/text from Gemini
      let title: string = '';
      const fullMbtiType = `${selectedResultForFeed.mbtiType}-${selectedResultForFeed.identity}`;
      const langName = SUPPORTED_LANGUAGES.find(l => l.code === languageForResult)?.name || languageForResult;

      if (actionType === 'mbtiExploration') {
        title = `Deep Dive: ${fullMbtiType} (in ${langName})`;
        if (selectedResultForFeed.detailedMbtiExploration) {
          rawContent = selectedResultForFeed.detailedMbtiExploration;
        } else {
          rawContent = await getDetailedMbtiExploration(fullMbtiType, selectedResultForFeed.personalitySummary || '', languageForResult);
          const updatedResult = { ...selectedResultForFeed, detailedMbtiExploration: rawContent, language: languageForResult };
          setSelectedResultForFeed(updatedResult);
          updateStoredHistory(updatedResult);
        }
      } else if (actionType === 'developmentStrategies') {
        title = `Development Strategies for ${fullMbtiType} (in ${langName})`;
        if (selectedResultForFeed.developmentStrategies) {
          rawContent = selectedResultForFeed.developmentStrategies;
        } else {
          rawContent = await getDevelopmentStrategies(selectedResultForFeed, languageForResult);
          const updatedResult = { ...selectedResultForFeed, developmentStrategies: rawContent, language: languageForResult };
          setSelectedResultForFeed(updatedResult);
          updateStoredHistory(updatedResult);
        }
      }

      if (rawContent) {
        const htmlContent = await marked.parse(rawContent);
        // For textContent, create a temporary element to strip HTML for copying
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        setModalContent({ title, htmlContent, textContent });
      } else {
        throw new Error("No content generated.");
      }

    } catch (err) {
      console.error("Error fetching detailed content:", err);
      setModalError(err instanceof Error ? err.message : "Failed to load content. Please try again.");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handlePrintSelectedResult = async () => {
    if (!selectedResultForFeed || !printableDashboardContentRef.current) return;

    document.body.classList.add('print-active-page');

    const explorationContent = selectedResultForFeed.detailedMbtiExploration ? await marked.parse(selectedResultForFeed.detailedMbtiExploration) : null;
    const strategiesContent = selectedResultForFeed.developmentStrategies ? await marked.parse(selectedResultForFeed.developmentStrategies) : null;

    const tempDetailsContainerId = 'print-only-details-dashboard';
    let tempDetailsContainer = document.getElementById(tempDetailsContainerId);
    if (tempDetailsContainer) tempDetailsContainer.remove();

    if (explorationContent || strategiesContent) {
        tempDetailsContainer = document.createElement('div');
        tempDetailsContainer.id = tempDetailsContainerId;
        tempDetailsContainer.className = 'print-only';

        let htmlToInject = '';
        if (explorationContent) {
            htmlToInject += `<h2 class="font-display text-2xl text-content mt-6 mb-3">Detailed MBTI Exploration</h2><div class="prose prose-sm sm:prose-base max-w-none">${explorationContent}</div>`;
        }
        if (strategiesContent) {
            htmlToInject += `<h2 class="font-display text-2xl text-content mt-6 mb-3">Development Strategies</h2><div class="prose prose-sm sm:prose-base max-w-none">${strategiesContent}</div>`;
        }
        tempDetailsContainer.innerHTML = htmlToInject;
        
        const selectedReportSection = document.getElementById('selected-report-printable-section');
        if (selectedReportSection) {
            selectedReportSection.appendChild(tempDetailsContainer);
        } else {
           printableDashboardContentRef.current.appendChild(tempDetailsContainer); 
        }
    }
    
    const onAfterPrint = () => {
        if (tempDetailsContainer && tempDetailsContainer.parentNode) {
            tempDetailsContainer.parentNode.removeChild(tempDetailsContainer);
        }
        document.body.classList.remove('print-active-page');
        window.removeEventListener('afterprint', onAfterPrint);
    };
    window.addEventListener('afterprint', onAfterPrint);

    window.print();
  };


  if (!currentUser) {
    return (
      <div className="text-center py-10 no-print">
        <h1 className="text-2xl font-display font-semibold text-primary">Please log in to view your dashboard.</h1>
        <p className="text-content-muted mt-2">Your personalized insights and history await!</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pb-12 printable-content-area" ref={printableDashboardContentRef}>
      <section className="bg-gradient-to-br from-primary/30 via-bground to-bground/80 rounded-xl shadow-2xl p-8 text-center no-print">
        <SparklesIcon className="w-16 h-16 text-accent mx-auto mb-4 animate-ping opacity-75"/>
        <h1 className="text-4xl lg:text-5xl font-display font-bold mb-2 text-shadow-accent-glow">Welcome, {currentUser.displayName || currentUser.email}!</h1>
        <p className="text-lg text-content-muted max-w-2xl mx-auto">
          This is your personal space for insights, growth, and self-discovery. Explore your past results and get personalized suggestions.
        </p>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="glassmorphism p-6 rounded-xl shadow-xl border border-neutral/20 no-print">
            <h2 className="text-2xl font-display font-semibold mb-5 text-secondary flex items-center">
                <ArrowPathIcon className="w-7 h-7 mr-2 text-secondary animate-spin-slow"/> Test History
            </h2>
            {testHistory.length > 0 ? (
              <ul className="space-y-3 max-h-[calc(100vh-25rem)] overflow-y-auto pr-2 custom-scrollbar">
                {testHistory.map((result, index) => (
                  <li key={result.timestamp || index} 
                      onClick={() => handleSelectResultForFeed(result)}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out hover:shadow-primary/30 transform hover:-translate-y-0.5
                                  ${selectedResultForFeed?.timestamp === result.timestamp && selectedResultForFeed?.language === result.language 
                                    ? 'bg-primary/20 ring-2 ring-primary shadow-lg' 
                                    : 'bg-bground-light/60 hover:bg-primary/10 border border-neutral/20'}`}>
                    <p className="font-semibold text-lg text-content flex justify-between items-center">
                      {result.mbtiType}-{result.identity} 
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedResultForFeed?.timestamp === result.timestamp && selectedResultForFeed?.language === result.language ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                        {result.language ? (SUPPORTED_LANGUAGES.find(l=>l.code === result.language)?.name.substring(0,3) || result.language) : 'N/A'}
                      </span>
                    </p>
                    <p className="text-xs text-content-muted mt-1">{result.timestamp ? new Date(result.timestamp).toLocaleDateString() : 'Recent'}</p>
                    <p className="text-sm text-content-muted mt-1 truncate">{result.personalitySummary || result.mbtiExplanation || 'View details'}...</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-content-muted">No test results saved yet. <Link to="/" className="text-accent hover:text-yellow-300 font-semibold">Take a test!</Link></p>
            )}
          </div>

          {selectedResultForFeed && (
             <div id="selected-report-printable-section" className="glassmorphism p-6 rounded-xl shadow-xl mt-6 animate-fade-in border border-neutral/20">
                <h3 className="text-xl font-display font-semibold mb-3 text-accent">Selected Report: {selectedResultForFeed.mbtiType}-{selectedResultForFeed.identity}</h3>
                 <p className="text-sm text-content-muted mb-1"><strong>Language:</strong> {SUPPORTED_LANGUAGES.find(l => l.code === selectedResultForFeed.language)?.name || selectedResultForFeed.language}</p>
                <p className="text-sm text-content-muted mb-1"><strong>Summary:</strong> {(selectedResultForFeed.personalitySummary || selectedResultForFeed.mbtiExplanation || 'N/A').substring(0,100)}...</p>
                <p className="text-sm text-content-muted mb-1"><strong>Career Snippet:</strong> {selectedResultForFeed.careerSuggestions?.[0] || 'N/A'}</p>
                {selectedResultForFeed.consciousnessLevelPrediction && <p className="text-sm text-content-muted mb-1"><strong>Consciousness:</strong> {selectedResultForFeed.consciousnessLevelPrediction.substring(0,100)}...</p>}
                <div className="flex space-x-3 mt-4 no-print">
                    <button onClick={() => viewFullReport(selectedResultForFeed)} className="text-sm text-primary hover:text-pink-400 font-semibold group transition-transform duration-300 ease-out hover:translate-x-1">
                        View Full Report <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">&rarr;</span>
                    </button>
                    <button onClick={handlePrintSelectedResult} className="text-sm text-teal-500 hover:text-teal-400 font-semibold group transition-transform duration-300 ease-out hover:translate-x-1 flex items-center">
                        <PrinterIcon className="w-4 h-4 mr-1"/> Print / Save PDF <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">&rarr;</span>
                    </button>
                </div>
                 {/* This div is for print-only header matching ResultsPage */}
                <div className="print-only report-header text-center">
                    <h1 className="text-2xl font-display font-bold mb-1">Personality Report: {selectedResultForFeed.mbtiType}-{selectedResultForFeed.identity}</h1>
                    <p className="text-lg font-semibold">{selectedResultForFeed.mbtiType} - {selectedResultForFeed.personalitySummary || selectedResultForFeed.mbtiExplanation || 'N/A'}</p>
                    {selectedResultForFeed.language && <p className="text-xs text-content-muted mt-1">(Results Language: {SUPPORTED_LANGUAGES.find(l => l.code === selectedResultForFeed.language)?.name || selectedResultForFeed.language})</p>}
                </div>
                {/* Print only: Basic info from selected result that's not in the main "full report" */}
                <div className="print-only mt-2">
                    <p><strong>Career Snippet:</strong> {selectedResultForFeed.careerSuggestions?.[0] || 'N/A'}</p>
                    {selectedResultForFeed.consciousnessLevelPrediction && <p><strong>Consciousness:</strong> {selectedResultForFeed.consciousnessLevelPrediction}</p>}
                    <p><strong>Justification:</strong> {selectedResultForFeed.hawkinsInsight}</p>
                </div>
             </div>
          )}
        </aside>

        <main className="lg:col-span-2 space-y-6">
          <div className="glassmorphism p-6 rounded-xl shadow-xl border border-neutral/20">
            <h2 className="text-2xl font-display font-semibold mb-6 text-primary flex items-center">
                <SparklesIcon className="w-8 h-8 mr-2 text-accent animate-pulse"/> Personalized Growth Feed
            </h2>
            {selectedResultForFeed ? ( personalizedFeed.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {personalizedFeed.map((item) => (
                  <FeedItemCard 
                    key={item.id} 
                    item={item} 
                    onActionClick={item.actionType ? () => handleFeedActionClick(item.actionType!) : undefined} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-content-muted">Your personalized feed is being generated...</p>
            )
            ) : (
                 <p className="text-content-muted">Select a test result from the history or <Link to="/" className="text-accent hover:text-yellow-300 font-semibold">take a new test</Link> to see your personalized feed.</p>
            )}
          </div>
        </main>
      </div>
      <DetailedContentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setModalContent(null); setModalError(null); setCopySuccessMessage(null);}}
        title={modalError ? "Error" : modalContent?.title || "Details"}
        isLoading={isModalLoading}
        modalContent={modalContent}
        copySuccessMessage={copySuccessMessage}
        setCopySuccessMessage={setCopySuccessMessage}
      >
        {modalError ? (
          <p className="text-red-400">{modalError}</p>
        ) : modalContent ? (
          <div className="prose prose-sm sm:prose-base max-w-none text-content-muted" dangerouslySetInnerHTML={{ __html: modalContent.htmlContent }} />
        ) : null}
      </DetailedContentModal>
    </div>
  );
};


interface FeedItemCardProps {
  item: FeedItem;
  onActionClick?: () => void;
}
const FeedItemCard: React.FC<FeedItemCardProps> = ({ item, onActionClick }) => {
  const cardBorderColor = 
    item.category === 'MBTI Deep Dive' ? 'border-pink-500' :
    item.category === 'Talent Discovery' ? 'border-yellow-500' :
    item.category === 'Potential Development' ? 'border-blue-500' :
    item.category === 'Self-Improvement' ? 'border-green-500' :
    item.category === 'Balanced Living' ? 'border-orange-500' :
    'border-neutral-500';

  return (
  <div className={`bg-bground-light/80 p-6 rounded-lg shadow-xl hover:shadow-primary/30 transition-all duration-300 flex flex-col justify-between animate-slide-up h-full border-l-4 ${cardBorderColor} hover:border-r-4 hover:border-l-0`}>
    <div>
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-1 rounded-full bg-primary/10">{item.icon || <LightBulbIcon className="w-6 h-6 text-accent" />}</div>
        <h3 className="text-lg font-display font-semibold text-content">{item.title}</h3>
      </div>
      <p className="text-sm text-content-muted mb-4 leading-relaxed flex-grow">{item.description}</p>
    </div>
    {item.actionText && (
      item.actionLink ? 
      <Link to={item.actionLink} className="mt-auto text-sm text-accent hover:text-yellow-300 self-start font-semibold group transition-transform duration-300 ease-out hover:translate-x-1">
        {item.actionText} <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">&rarr;</span>
      </Link>
      : onActionClick ?
      <button onClick={onActionClick} className="mt-auto text-sm text-accent hover:text-yellow-300 self-start font-semibold group transition-transform duration-300 ease-out hover:translate-x-1">
        {item.actionText} <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">&rarr;</span>
      </button>
      : <span className="mt-auto text-sm text-content-muted self-start">{item.actionText}</span>
    )}
  </div>
  );
};


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isLoading: boolean;
  children: React.ReactNode;
  modalContent: ModalContentType | null;
  copySuccessMessage: string | null;
  setCopySuccessMessage: (message: string | null) => void;
}

const DetailedContentModal: React.FC<ModalProps> = ({ 
  isOpen, onClose, title, isLoading, children, modalContent, copySuccessMessage, setCopySuccessMessage
}) => {
  if (!isOpen) return null;

  const handleCopyText = async () => {
    if (modalContent?.textContent) {
      try {
        await navigator.clipboard.writeText(modalContent.textContent);
        setCopySuccessMessage("Copied to clipboard!");
        setTimeout(() => setCopySuccessMessage(null), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        setCopySuccessMessage("Failed to copy.");
         setTimeout(() => setCopySuccessMessage(null), 2000);
      }
    }
  };

  const handlePrintModalContent = () => {
    const modalPrintWrapper = document.getElementById('modal-print-wrapper');
    if (!modalPrintWrapper) return;
    
    document.body.classList.add('print-active-modal');

    const onAfterPrint = () => {
        document.body.classList.remove('print-active-modal');
        window.removeEventListener('afterprint', onAfterPrint);
    };
    window.addEventListener('afterprint', onAfterPrint);
    window.print();
  };

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in modal-print-host" 
        onClick={onClose} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
    >
      <div 
        className="bg-bground-light p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up border border-neutral/30" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral/30 no-print">
          <h2 id="modal-title" className="text-2xl font-display font-bold text-primary">{title}</h2>
          <button 
            onClick={onClose}
            className="text-content-muted hover:text-content text-3xl font-light transition-colors"
            aria-label="Close modal"
          >&times;</button>
        </div>
        <div id="modal-print-wrapper" className="overflow-y-auto pr-2 flex-grow custom-scrollbar"> {/* This ID is targeted by print styles */}
          {isLoading ? (
            <LoadingSpinner text="Loading details..." />
          ) : (
            children
          )}
        </div>
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-neutral/30 no-print">
            <div>
                {copySuccessMessage && <span className="text-sm text-accent mr-4">{copySuccessMessage}</span>}
            </div>
            <div className="flex space-x-3">
                 {modalContent && !isLoading && (
                    <>
                        <button
                            onClick={handleCopyText}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 text-sm"
                            title="Copy text content"
                        >
                            <ClipboardDocumentIcon className="w-5 h-5"/>
                            <span>Copy Text</span>
                        </button>
                        <button
                            onClick={handlePrintModalContent}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 text-sm"
                            title="Print this section"
                        >
                            <PrinterIcon className="w-5 h-5"/>
                            <span>Print Section</span>
                        </button>
                    </>
                 )}
                <button
                    onClick={onClose}
                    className="bg-secondary hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg text-sm"
                >
                    Close
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
