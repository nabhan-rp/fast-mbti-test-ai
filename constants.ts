
import { MbtiType, Language } from './types';

export const APP_NAME = "MBTI Personality Insights AI";

export const GEMINI_MODEL_TEXT = "gemini-2.5-flash-preview-04-17";

export const MBTI_DESCRIPTIONS: Record<MbtiType, { summary: string, strengths: string[], weaknesses: string[] }> = {
  [MbtiType.ISTJ]: { summary: "Practical and fact-minded individuals, whose reliability cannot be doubted.", strengths: ["Responsible", "Organized", "Logical"], weaknesses: ["Stubborn", "Insensitive", "Judgmental"] },
  [MbtiType.ISFJ]: { summary: "Very dedicated and warm protectors, always ready to defend their loved ones.", strengths: ["Supportive", "Reliable", "Patient"], weaknesses: ["Shy", "Overly humble", "Takes things personally"] },
  [MbtiType.INFJ]: { summary: "Quiet and mystical, yet very inspiring and tireless idealists.", strengths: ["Insightful", "Principled", "Passionate"], weaknesses: ["Sensitive", "Extremely private", "Perfectionistic"] },
  [MbtiType.INTJ]: { summary: "Imaginative and strategic thinkers, with a plan for everything.", strengths: ["Strategic", "Independent", "Decisive"], weaknesses: ["Arrogant", "Judgmental", "Overly analytical"] },
  [MbtiType.ISTP]: { summary: "Bold and practical experimenters, masters of all kinds of tools.", strengths: ["Optimistic", "Practical", "Spontaneous"], weaknesses: ["Stubborn", "Insensitive", "Private and reserved"] },
  [MbtiType.ISFP]: { summary: "Flexible and charming artists, always ready to explore and experience something new.", strengths: ["Charming", "Sensitive to others", "Imaginative"], weaknesses: ["Fiercely independent", "Unpredictable", "Easily stressed"] },
  [MbtiType.INFP]: { summary: "Poetic, kind and altruistic people, always eager to help a good cause.", strengths: ["Empathetic", "Generous", "Open-minded"], weaknesses: ["Unrealistic", "Self-isolating", "Too idealistic"] },
  [MbtiType.INTP]: { summary: "Inventive and logical thinkers, with an unquenchable thirst for knowledge.", strengths: ["Analytical", "Original", "Open-minded"], weaknesses: ["Private", "Insensitive", "Absent-minded"] },
  [MbtiType.ESTP]: { summary: "Smart, energetic and very perceptive people, who truly enjoy living on the edge.", strengths: ["Bold", "Rational", "Practical"], weaknesses: ["Insensitive", "Impatient", "Risk-prone"] },
  [MbtiType.ESFP]: { summary: "Spontaneous, energetic and enthusiastic people – life is never boring around them.", strengths: ["Outgoing", "Spontaneous", "Resourceful"], weaknesses: ["Easily bored", "Unfocused", "Sensitive"] },
  [MbtiType.ENFP]: { summary: "Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.", strengths: ["Curious", "Observant", "Energetic"], weaknesses: ["Poor practical skills", "Easily stressed", "Overly emotional"] },
  [MbtiType.ENTP]: { summary: "Smart and curious thinkers who cannot resist an intellectual challenge.", strengths: ["Knowledgeable", "Quick thinker", "Original"], weaknesses: ["Argumentative", "Insensitive", "Intolerant"] },
  [MbtiType.ESTJ]: { summary: "Excellent administrators, unsurpassed at managing things – or people.", strengths: ["Dedicated", "Strong-willed", "Direct and honest"], weaknesses: ["Inflexible", "Stubborn", "Judgmental"] },
  [MbtiType.ESFJ]: { summary: "Extraordinarily caring, social and popular people, always eager to help.", strengths: ["Loyal", "Sensitive", "Good at connecting"], weaknesses: ["Worried about social status", "Inflexible", "Vulnerable to criticism"] },
  [MbtiType.ENFJ]: { summary: "Charismatic and inspiring leaders, able to mesmerize their listeners.", strengths: ["Tolerant", "Reliable", "Charismatic"], weaknesses: ["Overly idealistic", "Too selfless", "Sensitive"] },
  [MbtiType.ENTJ]: { summary: "Bold, imaginative and strong-willed leaders, always finding a way – or making one.", strengths: ["Efficient", "Energetic", "Self-confident"], weaknesses: ["Stubborn", "Dominant", "Intolerant"] },
};

export const HAWKINS_SCALE_BRIEF = "David Hawkins' Map of Consciousness is a logarithmic scale that maps levels of human consciousness, ranging from lower states like Shame and Guilt to higher states like Love, Joy, Peace, and Enlightenment. Each level is associated with specific emotions, perceptions, and ways of being, offering a framework for personal and spiritual growth.";

export const NEW_AGE_CONCEPTS_BRIEF = "New Age spirituality encompasses a wide range of beliefs and practices focused on self-spirituality, personal transformation, and holistic well-being. Common themes include the power of intention, manifestation, interconnectedness of all things, energy healing, mindfulness, and the pursuit of higher consciousness.";

export const LOCAL_STORAGE_HISTORY_KEY = 'mbtiAppUserHistory';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'zh', name: '中文 (Chinese Simplified)' },
  // { code: 'zh-TW', name: '中文 (Chinese Traditional)' }, // Gemini might treat zh and zh-TW similarly or prefer 'zh'
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'it', name: 'Italiano (Italian)' },
  { code: 'nl', name: 'Nederlands (Dutch)' },
  { code: 'sv', name: 'Svenska (Swedish)' },
  { code: 'tr', name: 'Türkçe (Turkish)' },
  { code: 'vi', name: 'Tiếng Việt (Vietnamese)' },
];
