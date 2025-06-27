import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { MbtiResult, QnAStep, QnAHistoryItem } from '../types';

const GEMINI_MODEL_TEXT = "gemini-2.5-flash-preview-04-17";

const robustJsonParse = (jsonString: string) => {
    let cleanJsonString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanJsonString.match(fenceRegex);
    if (match && match[2]) {
      cleanJsonString = match[2].trim(); 
    }
    
    try {
        return JSON.parse(cleanJsonString);
    } catch (e) {
        console.error("Failed to parse JSON string:", cleanJsonString);
        throw new Error("Invalid JSON response from AI. The format was not as expected.");
    }
}


async function processSelfDescription(ai: GoogleGenAI, payload: any): Promise<MbtiResult> {
  const { userInput, languageCode } = payload;
  const finalLangCode = languageCode || 'en';

  if (!userInput || typeof userInput !== 'string' || userInput.trim() === '') {
      throw new Error("userInput is a required string for processSelfDescription.");
  }
  const languageInstruction = `Respond in ${finalLangCode}. If the user's input is clearly in a different language, prioritize responding in the language of their input.`;
  
  const prompt = `
You are an expert MBTI analyst, career counselor, and personal development coach.
${languageInstruction}
Based on the following self-description, you must provide a comprehensive analysis.
It is crucial that you understand and interpret abbreviations, slang, or common typos in the user's input before making your analysis.

User's self-description:
"${userInput}"

Please format your response strictly as a JSON object with the following keys and value types:
- "mbtiType": string (e.g., "INTJ", "ESFP")
- "personalitySummary": string (1-2 sentences)
- "mbtiExplanation": string (2-3 sentences)
- "careerSuggestions": array of strings (3-5 suggestions)
- "organizationalRoles": array of strings (2-3 suggestions)
- "educationalAdvice": string
- "dailyLifeTips": string
- "hawkinsInsight": string (David Hawkins' Map of Consciousness insight)
- "newAgeConcept": string (New Age concept for growth)
- "language": string (The ISO 639-1 code of the language used for this response, e.g., "${finalLangCode}")

Example for "language" field: "language": "${finalLangCode}"

Ensure the entire response is a single, valid JSON object. Do not include any text outside of this JSON object.
Do not use markdown like \`\`\`json ... \`\`\` around the JSON response.
The "language" field in the JSON output MUST match the language you are using for the response text (e.g., if responding in Indonesian, set "language": "id").
`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: GEMINI_MODEL_TEXT,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const text = response.text;
  if (!text) {
      throw new Error("AI returned an empty response for description analysis.");
  }
  const parsedData = robustJsonParse(text);
  if (!parsedData.mbtiType || !parsedData.mbtiExplanation || !parsedData.language) {
      throw new Error("Received incomplete or malformed data from AI for description analysis.");
  }
  return parsedData as MbtiResult;
}

function parseQnAStep(responseText: string): QnAStep {
    const parsed = robustJsonParse(responseText);
    if (parsed.isFinal === undefined || (!parsed.isFinal && (!parsed.question || !parsed.choices))) {
        throw new Error("Malformed Q&A step from AI. Missing required fields.");
    }
    return parsed as QnAStep;
}

async function startOrContinueQnA(ai: GoogleGenAI, payload: any): Promise<QnAStep> {
  const { languageCode, initialDescription, history = [] } = payload;
  const finalLangCode = languageCode || 'en';
  const initialDescText = initialDescription || '';

  const qnaHistoryString = history.map((item: QnAHistoryItem) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
  let langInstruction = `Generate all questions and interactions in ${finalLangCode}.`;
  let prompt: string;

  if (history.length === 0) {
    if (initialDescText) {
      langInstruction = `The user wants to interact in ${finalLangCode}. The user has provided an initial self-description: "${initialDescText}". Generate your first question and all subsequent interactions in ${finalLangCode}. If the initial description is clearly in a language different from ${finalLangCode} and ${finalLangCode} is 'en', you may switch to the language of the initial description for a better user experience, and continue all interactions in that language.`;
      prompt = `You are an AI assistant facilitating an MBTI and personality assessment. ${langInstruction} Based on this, your goal is to understand the user more deeply through a series of multiple-choice questions. Also gather insights to estimate their general level of consciousness (David Hawkins' Map of Consciousness principles), focusing on typical reactions/interactions. Formulate the first multiple-choice question (3-4 options) that logically follows from their description or explores an interesting aspect. Questions should become progressively more specific. Response MUST be only JSON: {"question": "...", "choices": ["...", "..."], "isFinal": false}. Do not include any text outside of this JSON object. No markdown.`;
    } else {
      prompt = `You are an AI assistant for MBTI & personality assessment. ${langInstruction} Goal: Understand user deeply via multiple-choice Q&A. Estimate consciousness level (David Hawkins' Map) based on reactions/interactions. Ask an engaging first question (3-4 multiple choice options). Questions adapt to answers. Response MUST be only JSON: {"question": "...", "choices": ["...", "..."], "isFinal": false}. Do not include any text outside of this JSON object. No markdown.`;
    }
  } else {
    const lastEntry = history[history.length - 1];
    prompt = `You are an AI for MBTI & personality assessment. ${langInstruction} Initial Description (if any): "${initialDescText || 'Not provided'}" Conversation History (in ${finalLangCode}):\n${qnaHistoryString}\n\nUser just answered "${lastEntry.answer}" to question "${lastEntry.question}". Formulate the next relevant multiple-choice question (3-4 options) in ${finalLangCode} for MBTI traits and consciousness level. If you have enough information for a full analysis (MBTI, consciousness, detailed New Age advice), set "isFinal" to true and omit "question" and "choices". Otherwise, provide the next question. Response MUST be only JSON: {"question": "...", "choices": ["...", "..."], "isFinal": boolean} or {"isFinal": true}. Do not include any text outside of this JSON object. No markdown.`;
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: GEMINI_MODEL_TEXT,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      temperature: 0.6,
    }
  });
  const text = response.text;
  if (!text) {
      throw new Error("AI returned an empty response during Q&A step.");
  }
  return parseQnAStep(text);
}

async function getAnalysisFromQnA(ai: GoogleGenAI, payload: any): Promise<MbtiResult> {
  const { languageCode, initialDescription, history = [] } = payload;
  const finalLangCode = languageCode || 'en';
  const initialDescText = initialDescription || '';
  const qnaHistoryString = history.map((item: QnAHistoryItem) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
  const langInstruction = `Generate the entire analysis and all text fields in ${finalLangCode}. The "language" field in the JSON output must be "${finalLangCode}".`;

  const prompt = `You are an expert MBTI analyst, career counselor, and personal development coach. ${langInstruction} The user has completed a Q&A session. User's initial self-description (if provided, language may vary, but your output must be in ${finalLangCode}): "${initialDescText || 'Not provided'}"\n\nQ&A History (conducted in ${finalLangCode}):\n${qnaHistoryString}\n\nBased on the initial description (if provided) and the entire Q&A history, provide a comprehensive analysis. Estimate the user's general level of consciousness based on David Hawkins' Map of Consciousness, informed by their responses about daily interactions and emotional patterns. Explain your reasoning briefly. Provide more in-depth and personalized New Age suggestions for this user. Format response strictly as a JSON object with keys: "mbtiType", "personalitySummary", "mbtiExplanation", "careerSuggestions", "organizationalRoles", "educationalAdvice", "dailyLifeTips", "hawkinsInsight", "consciousnessLevelPrediction", "newAgeConcept", "detailedNewAgeSuggestions", "language" (must be "${finalLangCode}"). Ensure the entire response is a single, valid JSON object. No markdown.`;
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: GEMINI_MODEL_TEXT,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const text = response.text;
  if (!text) {
      throw new Error("AI returned an empty response for Q&A analysis.");
  }
  const parsedData = robustJsonParse(text);
  if (!parsedData.mbtiType || !parsedData.consciousnessLevelPrediction || !parsedData.detailedNewAgeSuggestions || !parsedData.language) {
      throw new Error("Received incomplete or malformed data from AI for Q&A analysis.");
  }
  return parsedData as MbtiResult;
}

async function getDetailedMbtiExploration(ai: GoogleGenAI, payload: any): Promise<string> {
  const { mbtiType, personalitySummary, languageCode } = payload;
  const finalLangCode = languageCode || 'en';
  if (!mbtiType || typeof mbtiType !== 'string') {
    throw new Error("mbtiType is a required string for getDetailedMbtiExploration.");
  }
  const summaryText = personalitySummary || '';
  const prompt = `You are an expert MBTI analyst. The user has been identified as ${mbtiType} and has a summary: "${summaryText}". Provide a detailed exploration of the ${mbtiType} personality type in ${finalLangCode}. This should be comprehensive and engaging, suitable for someone wanting to understand themselves better. Include information on: 1. Core characteristics and motivations. 2. Cognitive functions (e.g., for INFP: Fi-Ne-Si-Te) and how they typically manifest. 3. Common strengths in detail. 4. Potential challenges or areas for growth in detail. 5. Typical patterns in relationships (friendships, romantic, family). 6. How they might behave under stress. 7. Suggestions for leveraging their strengths. Format the output as a single string containing well-structured text in ${finalLangCode}. You can use simple Markdown for formatting (like ## for H2, ### for H3, * for italics/bold, - for lists). Do not output JSON. Just the detailed text content. Make it at least 300-500 words.`;
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: GEMINI_MODEL_TEXT,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { temperature: 0.7 },
  });
  const text = response.text;
  if (!text) {
      throw new Error("AI returned an empty response for detailed exploration.");
  }
  return text;
}

async function getDevelopmentStrategies(ai: GoogleGenAI, payload: any): Promise<string> {
  const { result, languageCode } = payload;
  const finalLangCode = languageCode || 'en';
   if (!result || !result.mbtiType) {
      throw new Error("A valid result object with an mbtiType is required for getDevelopmentStrategies.");
  }
  const prompt = `You are a personal development coach specializing in MBTI and holistic growth. The user has the following personality profile (content is in ${result.language || 'en'}): 
- MBTI Type: ${result.mbtiType}
- Personality Summary: ${result.personalitySummary || 'Not available'}
- Career Suggestions: ${(result.careerSuggestions || []).join(', ') || 'Not available'}
- Organizational Roles: ${(result.organizationalRoles || []).join(', ') || 'Not available'}
- Educational Advice: ${result.educationalAdvice || 'Not available'}
- Daily Life Tips: ${result.dailyLifeTips || 'Not available'}
- Hawkins Insight: ${result.hawkinsInsight || 'Not available'}
- Consciousness Level Prediction: ${result.consciousnessLevelPrediction || 'Not available'}
- New Age Concept: ${result.newAgeConcept || 'Not available'}
- Detailed New Age Suggestions: ${(result.detailedNewAgeSuggestions || []).join(', ') || 'Not available'}

Based on this complete profile, provide highly personalized and actionable development strategies IN ${finalLangCode}. Focus on: 1. Leveraging their core ${result.mbtiType} strengths for specific goals. 2. Addressing potential blind spots or challenges typical for ${result.mbtiType}. 3. Practical exercises or reflection prompts related to their Hawkins insight or consciousness level. 4. Ways to integrate their suggested New Age concept or practices more deeply. 5. Tips for developing "untapped potential". The strategies should be empathetic, encouraging, and provide clear steps or ideas, all in ${finalLangCode}. Format the output as a single string containing well-structured text. You can use simple Markdown for formatting. Do not output JSON. Just the detailed text content. Make it comprehensive, at least 300-500 words.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: GEMINI_MODEL_TEXT,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { temperature: 0.75 },
  });
  const text = response.text;
  if (!text) {
      throw new Error("AI returned an empty response for development strategies.");
  }
  return text;
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, payload } = req.body;
  console.log(`[API] Received action: "${action}"`);

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set or not accessible on the server.");
    }
    const ai = new GoogleGenAI({ apiKey });

    let result;

    switch (action) {
      case 'processSelfDescription':
        result = await processSelfDescription(ai, payload);
        break;
      case 'startOrContinueQnA':
        result = await startOrContinueQnA(ai, payload);
        break;
      case 'getAnalysisFromQnA':
        result = await getAnalysisFromQnA(ai, payload);
        break;
      case 'getDetailedMbtiExploration':
        result = await getDetailedMbtiExploration(ai, payload);
        break;
      case 'getDevelopmentStrategies':
        result = await getDevelopmentStrategies(ai, payload);
        break;
      default:
        console.warn(`[API] Invalid action received: "${action}"`);
        return res.status(400).json({ error: `Invalid action: ${action}` });
    }
    
    console.log(`[API] Successfully completed action: "${action}"`);
    return res.status(200).json(result);

  } catch (error) {
    console.error(`[API] Error processing action "${action}":`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return res.status(500).json({ error: errorMessage });
  }
}