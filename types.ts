
export interface MbtiResult {
  mbtiType: string;
  mbtiExplanation: string;
  careerSuggestions: string[];
  organizationalRoles: string[];
  educationalAdvice: string;
  dailyLifeTips: string;
  hawkinsInsight: string;
  newAgeConcept: string;
  personalitySummary?: string; 
  timestamp?: string; 
  consciousnessLevelPrediction?: string; 
  detailedNewAgeSuggestions?: string[]; 

  detailedMbtiExploration?: string;
  developmentStrategies?: string;
  language?: string; // ISO 639-1 language code (e.g., "en", "id")
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>; 
  loginWithEmail: (email: string, pass: string) => Promise<void>; 
  signupWithEmail: (email: string, pass: string) => Promise<void>; 
  logout: () => Promise<void>; 
}

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  category: 'Self-Improvement' | 'Potential Development' | 'Talent Discovery' | 'Balanced Living' | 'MBTI Deep Dive';
  icon?: React.ReactNode;
  actionText?: string;
  actionType?: 'mbtiExploration' | 'developmentStrategies'; 
  actionLink?: string; 
}

export enum MbtiType {
    ISTJ = "ISTJ", ISFJ = "ISFJ", INFJ = "INFJ", INTJ = "INTJ",
    ISTP = "ISTP", ISFP = "ISFP", INFP = "INFP", INTP = "INTP",
    ESTP = "ESTP", ESFP = "ESFP", ENFP = "ENFP", ENTP = "ENTP",
    ESTJ = "ESTJ", ESFJ = "ESFJ", ENFJ = "ENFJ", ENTJ = "ENTJ"
}

export interface QnAStep {
  question: string;
  choices: string[];
  isFinal: boolean; 
}

export interface QnAHistoryItem {
  question: string;
  answer: string;
  choices?: string[]; 
}

export interface Language {
  code: string;
  name: string;
}
