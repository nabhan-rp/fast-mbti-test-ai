
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MbtiResult, QnAStep, QnAHistoryItem } from '../types';
import { GEMINI_MODEL_TEXT } from '../constants';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set. Gemini API calls cannot be made.");
  }
  return new GoogleGenAI({ apiKey });
};

// Mode 1: Classic Description
export const processSelfDescription = async (userInput: string, languageCode: string = 'en'): Promise<MbtiResult> => {
  const ai = getAiClient();
  const languageInstruction = `Respond in ${languageCode}. If the user's input is clearly in a different language, prioritize responding in the language of their input.`;
  
  const prompt = `
You are an expert MBTI analyst, career counselor, and personal development coach with deep knowledge of the "A/T" (Assertive/Turbulent) identity model and David Hawkins' Map of Consciousness.
${languageInstruction}
Based on the following self-description, provide a comprehensive analysis. Look for clues about confidence, stress handling, and perfectionism to determine the A/T identity. Estimate the percentage breakdown for each MBTI dichotomy based on the user's text. Your analysis of Hawkins' LoC should be insightful, and New Age tips should be personalized to that LoC. Career/Org roles should be detailed.
It is crucial that you understand and interpret abbreviations, slang, or common typos in the user's input before making your analysis.

User's self-description:
"${userInput}"

Please format your response strictly as a JSON object with the following structure and value types:
- "mbtiType": string (e.g., "INTJ", "ESFP")
- "identity": string ("A" for Assertive or "T" for Turbulent)
- "dichotomyPercentages": object with keys "I", "E", "N", "S", "T", "F", "J", "P", and integer values from 0-100, where I+E=100, N+S=100, etc. (e.g., { "I": 70, "E": 30, ... })
- "personalitySummary": string (1-2 sentences)
- "mbtiExplanation": string (2-3 sentences explaining the type and A/T identity)
- "careerSuggestions": array of strings (3-5 detailed suggestions)
- "organizationalRoles": array of strings (2-3 detailed suggestions)
- "educationalAdvice": string
- "dailyLifeTips": string
- "hawkinsInsight": string (A detailed David Hawkins' Map of Consciousness insight, linking their potential LoC to their described behaviors.)
- "consciousnessLevelPrediction": string (e.g., "Operates at Reason (400), exploring Love (500). Justification: ...")
- "newAgeConcept": string (New Age concept for growth)
- "detailedNewAgeSuggestions": array of strings (2-3 actionable tips to raise their LoC)
- "language": string (The ISO 639-1 code of the language used for this response, e.g., "${languageCode}")

Example for "language" field: "language": "${languageCode}"
Example for dichotomyPercentages: { "I": 20, "E": 80, "N": 70, "S": 30, "T": 40, "F": 60, "J": 85, "P": 15 }

Ensure the entire response is a single, valid JSON object. Do not include any text outside of this JSON object.
Do not use markdown like \`\`\`json ... \`\`\` around the JSON response.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });
    let jsonStr = response.text.trim();
    const parsedData = JSON.parse(jsonStr);
    if (!parsedData.mbtiType || !parsedData.identity || !parsedData.dichotomyPercentages || !parsedData.language) {
        throw new Error("Received incomplete or malformed data from AI for description analysis.");
    }
    return parsedData as MbtiResult;
  } catch (error) {
    console.error("Error in processSelfDescription:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) throw error;
    throw new Error(`Failed to get insights from description. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
};


// Mode 2 & 3: Q&A Functions
const parseQnAResponse = (responseText: string): QnAStep => {
    let jsonStr = responseText.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim(); 
    }
    const parsed = JSON.parse(jsonStr);
    if (parsed.isFinal === undefined || (!parsed.isFinal && (!parsed.question || !parsed.choices))) {
        throw new Error("Malformed Q&A step from AI. Missing required fields.");
    }
    return parsed as QnAStep;
}

export const startOrContinueQnA = async (languageCode: string, initialDescription?: string, history: QnAHistoryItem[] = []): Promise<QnAStep> => {
  const ai = getAiClient();
  let prompt: string;

  const qnaHistoryString = history.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
  let langInstruction = `Generate all questions and interactions in ${languageCode}.`;

  const coreGoal = `Your goal is to deeply understand the user to determine their:
1. MBTI type (I/E, N/S, T/F, J/P).
2. MBTI identity (Assertive/Turbulent - A/T) by asking about confidence, stress response, and perfectionism.
3. Level of Consciousness (Hawkins' map) by asking about worldview, core motivations, and emotional patterns.
The questions should be engaging, multiple-choice (3-4 options), and adapt based on previous answers.`;


  if (history.length === 0) { // First question
    if (initialDescription) { // Hybrid mode
      langInstruction = `The user wants to interact in ${languageCode}. The user has provided an initial self-description: "${initialDescription}". Generate your first question and all subsequent interactions in ${languageCode}. If the initial description is clearly in a language different from ${languageCode} and ${languageCode} is 'en', you may switch to the language of the initial description for a better user experience, and continue all interactions in that language.`;

      prompt = `You are an AI assistant for a deep personality assessment.
${langInstruction}
${coreGoal}
Based on their initial description, formulate the first insightful multiple-choice question.
Response JSON: {"question": "...", "choices": ["...", "..."], "isFinal": false}
No markdown.`;
    } else { // Pure Q&A mode
      prompt = `You are an AI assistant for a deep personality assessment.
${langInstruction}
${coreGoal}
Start with an engaging first question to begin the assessment.
Response JSON: {"question": "...", "choices": ["...", "..."], "isFinal": false}
No markdown.`;
    }
  } else { // Subsequent questions
    const lastEntry = history[history.length -1];
    prompt = `You are an AI for a deep personality assessment.
${langInstruction}
${coreGoal}
Initial Description (if any): "${initialDescription || 'Not provided'}"
Conversation History (in ${languageCode}):
${qnaHistoryString}

User just answered "${lastEntry.answer}" to question "${lastEntry.question}".
Formulate the next relevant multiple-choice question in ${languageCode}.
If you have sufficient information for a full, detailed analysis on all points (MBTI, A/T, LoC), set "isFinal" to true. Otherwise, provide the next question.
Response JSON: {"question": "...", "choices": ["...", "..."], "isFinal": boolean} or {"isFinal": true}
No markdown.`;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{text: prompt}]}],
      config: {
        responseMimeType: "application/json",
        temperature: 0.65, 
      }
    });
    return parseQnAResponse(response.text);
  } catch (error) {
    console.error("Error in startOrContinueQnA:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) throw error;
    throw new Error(`AI Q&A step failed. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getAnalysisFromQnA = async (languageCode: string, initialDescription?: string, history: QnAHistoryItem[] = []): Promise<MbtiResult> => {
  const ai = getAiClient();
  const qnaHistoryString = history.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
  const langInstruction = `Generate the entire analysis and all text fields in ${languageCode}. The "language" field in the JSON output must be "${languageCode}".`;


  const prompt = `You are an expert MBTI analyst, career counselor, and personal development coach with deep knowledge of the "A/T" (Assertive/Turbulent) identity model and David Hawkins' Map of Consciousness.
${langInstruction}
The user has completed a Q&A session.
User's initial self-description (if provided): "${initialDescription || 'Not provided'}"

Q&A History (conducted in ${languageCode}):
${qnaHistoryString}

Based on the initial description (if provided) and the entire Q&A history, provide a comprehensive analysis.
Determine the A/T identity from answers about stress, confidence, etc.
Calculate the percentage breakdown for each MBTI dichotomy.
Provide a more detailed and justified Hawkins' LoC analysis.
Personalize the New Age tips to help the user raise their LoC.
Career/Org roles should be more detailed.

Format response strictly as a JSON object with keys:
- "mbtiType": string
- "identity": string ("A" for Assertive or "T" for Turbulent)
- "dichotomyPercentages": object with keys "I", "E", "N", "S", "T", "F", "J", "P", and integer values from 0-100, where I+E=100, N+S=100, etc.
- "personalitySummary": string (concise summary from Q&A)
- "mbtiExplanation": string (MBTI and A/T fit from Q&A)
- "careerSuggestions": array of strings (3-5 detailed suggestions)
- "organizationalRoles": array of strings (2-3 detailed suggestions)
- "educationalAdvice": string
- "dailyLifeTips": string
- "hawkinsInsight": string (A detailed David Hawkins' Map of Consciousness insight, linking their potential LoC to their described behaviors.)
- "consciousnessLevelPrediction": string (e.g., "Operates at Reason (400), exploring Love (500). Justification: ...")
- "newAgeConcept": string (primary New Age concept)
- "detailedNewAgeSuggestions": array of strings (2-3 actionable tips to raise their LoC)
- "language": string (The ISO 639-1 code of the language used for this response, MUST BE "${languageCode}")

Ensure the entire response is a single, valid JSON object. No markdown.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });
    let jsonStr = response.text.trim();
    const parsedData = JSON.parse(jsonStr);
    
    if (!parsedData.mbtiType || !parsedData.identity || !parsedData.dichotomyPercentages || !parsedData.consciousnessLevelPrediction || !parsedData.detailedNewAgeSuggestions || !parsedData.language) {
        throw new Error("Received incomplete or malformed data from AI for Q&A analysis.");
    }
    // Ensure the language field from AI matches requested, or handle discrepancy
    if (parsedData.language !== languageCode) {
        console.warn(`AI responded in ${parsedData.language} but ${languageCode} was requested. Using AI's reported language.`);
    }
    return parsedData as MbtiResult;
  } catch (error) {
    console.error("Error in getAnalysisFromQnA:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) throw error;
    throw new Error(`Failed to get final analysis from Q&A. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
};


export const getDetailedMbtiExploration = async (mbtiType: string, personalitySummary: string, languageCode: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
You are an expert MBTI analyst.
The user has been identified as ${mbtiType} and has a summary: "${personalitySummary}".
Provide a detailed exploration of the ${mbtiType} personality type in ${languageCode}.
This should be comprehensive and engaging, suitable for someone wanting to understand themselves better.
Include information on:
1.  Core characteristics and motivations.
2.  Cognitive functions (e.g., for INFP: Fi-Ne-Si-Te) and how they typically manifest.
3.  Common strengths in detail.
4.  Potential challenges or areas for growth in detail.
5.  Typical patterns in relationships (friendships, romantic, family).
6.  How they might behave under stress.
7.  Suggestions for leveraging their strengths.

Format the output as a single string containing well-structured text in ${languageCode}. You can use simple Markdown for formatting (like ## for H2, ### for H3, * for italics/bold, - for lists).
Do not output JSON. Just the detailed text content.
Make it at least 300-500 words.
`;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7, 
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error in getDetailedMbtiExploration:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) throw error;
    throw new Error(`Failed to get detailed MBTI exploration. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getDevelopmentStrategies = async (result: MbtiResult, languageCode: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
You are a personal development coach specializing in MBTI and holistic growth.
The user has the following personality profile (content is in ${result.language || 'unknown language, assume English if not specified, but respond in target language'}):
- MBTI Type: ${result.mbtiType}-${result.identity}
- Dichotomy Percentages: I/E: ${result.dichotomyPercentages.I}/${result.dichotomyPercentages.E}, N/S: ${result.dichotomyPercentages.N}/${result.dichotomyPercentages.S}, T/F: ${result.dichotomyPercentages.T}/${result.dichotomyPercentages.F}, J/P: ${result.dichotomyPercentages.J}/${result.dichotomyPercentages.P}
- Personality Summary: ${result.personalitySummary || 'Not available'}
- Career Suggestions: ${result.careerSuggestions.join(', ')}
- Organizational Roles: ${result.organizationalRoles.join(', ')}
- Educational Advice: ${result.educationalAdvice}
- Daily Life Tips: ${result.dailyLifeTips}
- Hawkins Insight: ${result.hawkinsInsight}
- Consciousness Level Prediction: ${result.consciousnessLevelPrediction || 'Not available'}
- New Age Concept: ${result.newAgeConcept}
- Detailed New Age Suggestions: ${result.detailedNewAgeSuggestions?.join(', ') || 'Not available'}

Based on this complete profile, provide highly personalized and actionable development strategies IN ${languageCode}.
Focus on:
1.  Leveraging their core ${result.mbtiType} strengths, considering their ${result.identity} identity (e.g., how an ENFJ-A leads vs an ENFJ-T).
2.  Addressing blind spots, especially those common for their -${result.identity} variant.
3.  Practical exercises or reflection prompts related to their Hawkins insight and to help them elevate their consciousness level.
4.  Ways to integrate their suggested New Age concept more deeply to foster growth.
5.  Tips for developing "untapped potential" by balancing their dichotomies (e.g., if highly Extraverted, suggest ways to develop their Introverted side).

The strategies should be empathetic, encouraging, and provide clear steps or ideas, all in ${languageCode}.
Format the output as a single string containing well-structured text. You can use simple Markdown for formatting.
Do not output JSON. Just the detailed text content.
Make it comprehensive, at least 300-500 words.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.75, 
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error in getDevelopmentStrategies:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) throw error;
    throw new Error(`Failed to get development strategies. Details: ${error instanceof Error ? error.message : String(error)}`);
  }
};
