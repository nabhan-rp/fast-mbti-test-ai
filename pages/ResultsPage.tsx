
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MbtiResult, User, MbtiType } from '../types';
import { MBTI_DESCRIPTIONS, HAWKINS_SCALE_BRIEF, NEW_AGE_CONCEPTS_BRIEF, LOCAL_STORAGE_HISTORY_KEY, SUPPORTED_LANGUAGES } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { marked } from 'https://esm.sh/marked@^12.0.2';
import { 
  BookOpenIcon, BriefcaseIcon, AcademicCapIcon, LightBulbIcon, UsersIcon, SparklesIcon, ChartBarIcon, ArrowPathIcon, SunIcon, PrinterIcon 
} from '../components/icons/HeroIcons'; 

interface ResultsPageProps {
  resultData: MbtiResult | null;
  setLatestResult: (result: MbtiResult | null) => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ resultData, setLatestResult }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const printableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!resultData) {
      navigate('/');
    }
    window.scrollTo(0, 0);
  }, [resultData, navigate]);

  if (!resultData) {
    return <LoadingSpinner text="Loading results..." />;
  }

  const mbtiDetails = MBTI_DESCRIPTIONS[resultData.mbtiType as MbtiType] || { summary: "No detailed description available.", strengths: [], weaknesses: [] };
  const currentLanguageName = SUPPORTED_LANGUAGES.find(l => l.code === resultData.language)?.name || resultData.language || "English";

  const handleSaveResult = () => {
    if (!currentUser) {
      alert("Please log in to save your results for future reference and personalized dashboard insights.");
      return;
    }
    const historyString = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    let history: { user: User, results: MbtiResult[] }[] = historyString ? JSON.parse(historyString) : [];
    
    const resultToSave: MbtiResult = {
        ...resultData, 
        timestamp: resultData.timestamp || new Date().toISOString(),
        language: resultData.language || 'en' 
    };

    const userHistoryIndex = history.findIndex(entry => entry.user.uid === currentUser.uid);
    
    if (userHistoryIndex > -1) {
      history[userHistoryIndex].results.unshift(resultToSave);
    } else {
      history.push({ user: currentUser, results: [resultToSave] });
    }
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    alert("Result saved! You can view it in your Dashboard.");
  };

  const handleEmailResult = () => {
    const subject = `Your MBTI Personality Insights: ${resultData.mbtiType} (in ${currentLanguageName})`;
    let body = `
      Hello,

      Here are your MBTI Personality Insights (Language: ${currentLanguageName}):

      Your Type: ${resultData.mbtiType}
      Summary: ${resultData.personalitySummary || mbtiDetails.summary}
      Explanation: ${resultData.mbtiExplanation}

      Career Suggestions:
      ${resultData.careerSuggestions.map(s => `- ${s}`).join('\n')}

      Organizational Roles:
      ${resultData.organizationalRoles.map(s => `- ${s}`).join('\n')}

      Educational Advice: ${resultData.educationalAdvice}
      Daily Life Tips: ${resultData.dailyLifeTips}
      Hawkins Insight: ${resultData.hawkinsInsight}
    `;
    if (resultData.consciousnessLevelPrediction) {
      body += `\nConsciousness Level Prediction: ${resultData.consciousnessLevelPrediction}\n`;
    }
    body += `\nNew Age Concept: ${resultData.newAgeConcept}\n`;
    if (resultData.detailedNewAgeSuggestions && resultData.detailedNewAgeSuggestions.length > 0) {
      body += `\nDetailed New Age Suggestions:\n${resultData.detailedNewAgeSuggestions.map(s => `- ${s}`).join('\n')}\n`;
    }
     if (resultData.detailedMbtiExploration) {
      body += `\n\nDetailed MBTI Exploration:\n${resultData.detailedMbtiExploration.replace(/<[^>]*>?/gm, '')}\n`; // Basic HTML strip for email
    }
    if (resultData.developmentStrategies) {
      body += `\n\nDevelopment Strategies:\n${resultData.developmentStrategies.replace(/<[^>]*>?/gm, '')}\n`; // Basic HTML strip
    }
    body += `\nThank you for using MBTI Personality Insights AI!`;
    console.log("Mock Email Send:", { subject, body });
    alert(`A copy of your results (in ${currentLanguageName}) has been logged to the console (mock email). In a real app, this would be emailed.`);
  };

  const handleDiscardResult = () => {
    setLatestResult(null);
    navigate('/');
  };
  
  const handlePrintOrExportPdf = async () => {
    if (!resultData) return;

    document.body.classList.add('print-active-page');
    const mainContentArea = printableContentRef.current;
    if (mainContentArea) {
      mainContentArea.classList.add('printable-content-area');
    }


    const explorationContent = resultData.detailedMbtiExploration ? await marked.parse(resultData.detailedMbtiExploration) : null;
    const strategiesContent = resultData.developmentStrategies ? await marked.parse(resultData.developmentStrategies) : null;

    const tempDetailsContainerId = 'print-only-details-results';
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
        
        if (mainContentArea) {
            mainContentArea.appendChild(tempDetailsContainer);
        } else {
            document.body.appendChild(tempDetailsContainer); 
        }
    }

    const onAfterPrint = () => {
        if (tempDetailsContainer && tempDetailsContainer.parentNode) {
            tempDetailsContainer.parentNode.removeChild(tempDetailsContainer);
        }
        document.body.classList.remove('print-active-page');
        if (mainContentArea) {
          mainContentArea.classList.remove('printable-content-area');
        }
        window.removeEventListener('afterprint', onAfterPrint);
    };
    window.addEventListener('afterprint', onAfterPrint);

    window.print();
  };


  const ActionButton: React.FC<{ onClick?: () => void; text: string; icon?: React.ReactNode; className?: string; to?: string }> = ({ onClick, text, icon, className, to }) => {
    const commonClasses = `flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 no-print`; // Added no-print
    if (to) {
      return (
        <Link to={to} className={`${commonClasses} ${className || 'bg-secondary hover:bg-blue-700 text-white'}`}>
          {icon}
          <span>{text}</span>
        </Link>
      );
    }
    return (
      <button
        onClick={onClick}
        className={`${commonClasses} ${className || 'bg-secondary hover:bg-blue-700 text-white'}`}
      >
        {icon}
        <span>{text}</span>
      </button>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 pb-12" ref={printableContentRef}>
      <header className="text-center py-12 bg-gradient-to-br from-primary/40 via-bground/70 to-bground rounded-xl shadow-2xl p-6 relative overflow-hidden no-print">
        <SparklesIcon className="w-16 h-16 text-accent mx-auto mb-4 animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 text-shadow-accent-glow">Your Personality Revealed</h1>
        <p className="text-3xl text-primary font-semibold font-display tracking-wider">{resultData.mbtiType}</p>
        <p className="text-lg text-content-muted max-w-2xl mx-auto mt-2">
          {resultData.personalitySummary || mbtiDetails.summary}
        </p>
         {resultData.language && <p className="text-sm text-content-muted mt-1">(Results generated in {currentLanguageName})</p>}
      </header>
      
      {/* This section will be visible for print, mimicking the header */}
      <div className="print-only text-center py-6">
        <h1 className="text-3xl font-display font-bold mb-2">Personality Report: {resultData.mbtiType}</h1>
        <p className="text-xl font-semibold mb-1">{resultData.mbtiType} - {resultData.personalitySummary || mbtiDetails.summary}</p>
        {resultData.language && <p className="text-sm text-content-muted mt-1">(Results Language: {currentLanguageName})</p>}
      </div>


      <section className="glassmorphism p-6 sm:p-8 rounded-xl shadow-xl space-y-8 border border-neutral/20">
        <div className="flex flex-wrap gap-4 justify-center items-center py-6 border-b border-neutral/20 action-buttons-container no-print">
            <ActionButton onClick={handlePrintOrExportPdf} text="Print / Save PDF" icon={<PrinterIcon className="w-5 h-5"/>} className="bg-teal-600 hover:bg-teal-700 text-white"/>
            <ActionButton onClick={handleSaveResult} text="Save Result" icon={<BriefcaseIcon className="w-5 h-5"/>} className="bg-pink-600 hover:bg-pink-700 text-white"/>
            <ActionButton onClick={handleEmailResult} text="Email Me This" icon={<LightBulbIcon className="w-5 h-5"/>} className="bg-blue-600 hover:bg-blue-700 text-white" />
            <ActionButton onClick={handleDiscardResult} text="Discard & Test Again" icon={<ArrowPathIcon className="w-5 h-5"/>} className="bg-neutral/60 hover:bg-neutral/70 text-content"/>
            {currentUser && <ActionButton to="/dashboard" text="Go to Dashboard" icon={<ChartBarIcon className="w-5 h-5"/>} className="bg-accent hover:bg-yellow-500 text-bground font-bold" />}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ResultCard title="MBTI Explanation" icon={<BookOpenIcon className="text-pink-500" />}>
              <p className="text-content-muted leading-relaxed">{resultData.mbtiExplanation}</p>
              {mbtiDetails && (
                <div className="mt-4">
                  <button onClick={() => setShowFullDescription(!showFullDescription)} className="text-sm text-accent hover:text-yellow-300 font-medium no-print">
                    {showFullDescription ? "Hide" : "Show"} Standard {resultData.mbtiType} Profile
                  </button>
                  {/* Standard profile is shown for print if button would have shown it */}
                  <div className={`${showFullDescription ? '' : 'hidden'} ${showFullDescription ? 'md:block' : 'print-only'} mt-2 p-3 bg-bground-light/50 rounded animate-fade-in border border-neutral/20`}>
                    <h4 className="font-semibold font-display text-content mb-1">Strengths:</h4>
                    <ul className="list-disc list-inside text-sm text-content-muted space-y-1">
                      {mbtiDetails.strengths.map(s => <li key={s}>{s}</li>)}
                    </ul>
                    <h4 className="font-semibold font-display text-content mt-3 mb-1">Potential Weaknesses:</h4>
                    <ul className="list-disc list-inside text-sm text-content-muted space-y-1">
                      {mbtiDetails.weaknesses.map(s => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </ResultCard>

            <ResultCard title="Career Suggestions" icon={<BriefcaseIcon className="text-blue-500" />}>
              <ul className="list-disc list-inside text-content-muted space-y-2">
                {resultData.careerSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </ResultCard>

            <ResultCard title="Organizational Roles" icon={<UsersIcon className="text-yellow-500" />}>
              <ul className="list-disc list-inside text-content-muted space-y-2">
                {resultData.organizationalRoles.map((role, index) => (
                  <li key={index}>{role}</li>
                ))}
              </ul>
            </ResultCard>
          </div>

          <div className="space-y-6">
            <ResultCard title="Educational Advice" icon={<AcademicCapIcon className="text-purple-500" />}>
              <p className="text-content-muted leading-relaxed">{resultData.educationalAdvice}</p>
            </ResultCard>

            <ResultCard title="Daily Life & Growth Tips" icon={<LightBulbIcon className="text-green-500" />}>
              <p className="text-content-muted leading-relaxed">{resultData.dailyLifeTips}</p>
            </ResultCard>
            
            <ResultCard title="Hawkins' Consciousness Insight" icon={<ChartBarIcon className="text-teal-500" />}>
              <p className="text-content-muted leading-relaxed mb-2">{resultData.hawkinsInsight}</p>
              {resultData.consciousnessLevelPrediction && (
                <p className="text-content-muted leading-relaxed mb-2 text-sm italic"><strong>Prediction:</strong> {resultData.consciousnessLevelPrediction}</p>
              )}
              <details className="text-sm group no-print">
                <summary className="cursor-pointer text-accent hover:text-yellow-300 font-medium group-open:mb-1">About Hawkins' Map</summary>
                <p className="mt-1 text-content-muted/80">{HAWKINS_SCALE_BRIEF}</p>
              </details>
               <div className="print-only text-sm mt-2"> {/* Show for print */}
                <h4 className="font-semibold text-content mb-1">About Hawkins' Map:</h4>
                <p className="text-content-muted/80">{HAWKINS_SCALE_BRIEF}</p>
              </div>
            </ResultCard>

            <ResultCard title="New Age Concept for Growth" icon={<SunIcon className="text-orange-500" />}>
              <p className="text-content-muted leading-relaxed mb-2">{resultData.newAgeConcept}</p>
              {resultData.detailedNewAgeSuggestions && resultData.detailedNewAgeSuggestions.length > 0 && (
                <div className="my-3">
                  <h4 className="font-semibold font-display text-content mb-1">Personalized Practices:</h4>
                  <ul className="list-disc list-inside text-sm text-content-muted space-y-1">
                    {resultData.detailedNewAgeSuggestions.map((tip, index) => <li key={index}>{tip}</li>)}
                  </ul>
                </div>
              )}
               <details className="text-sm group no-print">
                <summary className="cursor-pointer text-accent hover:text-yellow-300 font-medium group-open:mb-1">About New Age Concepts</summary>
                <p className="mt-1 text-content-muted/80">{NEW_AGE_CONCEPTS_BRIEF}</p>
              </details>
              <div className="print-only text-sm mt-2"> {/* Show for print */}
                <h4 className="font-semibold text-content mb-1">About New Age Concepts:</h4>
                <p className="text-content-muted/80">{NEW_AGE_CONCEPTS_BRIEF}</p>
              </div>
            </ResultCard>
          </div>
        </div>
      </section>

      <section className="text-center mt-12 no-print">
        <Link to="/" className="text-primary hover:text-accent font-semibold transition-colors duration-300 text-lg group">
          &larr; <span className="group-hover:underline">Take Another Test or Explore Home</span>
        </Link>
      </section>
    </div>
  );
};

interface ResultCardProps {
  title: string;
  icon: React.ReactElement<{ className?: string }>;
  children: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children }) => (
  <div className="bg-bground-light p-6 rounded-lg shadow-lg hover:shadow-primary/20 transition-shadow duration-300 animate-slide-up border border-neutral/20">
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 bg-primary/10 rounded-full shadow-inner">
         {React.cloneElement(icon, { className: 'w-6 h-6 ' + (icon.props.className || '') })}
      </div>
      <h3 className="text-xl font-display font-semibold text-content">{title}</h3>
    </div>
    <div className="prose prose-sm sm:prose-base max-w-none text-content-muted">
        {children}
    </div>
  </div>
);

export default ResultsPage;