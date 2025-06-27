
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
You are an expert MBTI analyst, career counselor, and personal development coach.
${languageInstruction}
Based on the following self-description, please provide a comprehensive analysis.
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
- "language": string (The ISO 639-1 code of the language used for this response, e.g., "${languageCode}")

Example for "language" field: "language": "${languageCode}"

Ensure the entire response is a single, valid JSON object. Do not include any text outside of this JSON object.
Do not use markdown like \`\`\`json ... \`\`\` around the JSON response.
The "language" field in the JSON output MUST match the language you are using for the response text (e.g., if responding in Indonesian, set "language": "id").
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
    if (!parsedData.mbtiType || !parsedData.mbtiExplanation || !parsedData.language) {
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

  if (history.length === 0) { // First question
    if (initialDescription) { // Hybrid mode
      // For hybrid, Gemini should try to use language of initialDescription if languageCode is generic like 'en' but description is different.
      // However, if a specific languageCode is passed, that should be honored.
      // The prompt will guide it to use the language of the description if it's clear and specific, otherwise stick to languageCode.
      langInstruction = `The user wants to interact in ${languageCode}. The user has provided an initial self-description: "${initialDescription}". Generate your first question and all subsequent interactions in ${languageCode}. If the initial description is clearly in a language different from ${languageCode} and ${languageCode} is 'en', you may switch to the language of the initial description for a better user experience, and continue all interactions in that language.`;

      prompt = `You are an AI assistant facilitating an MBTI and personality assessment.
${langInstruction}
Based on this, your goal is to understand the user more deeply through a series of multiple-choice questions.
Also gather insights to estimate their general level of consciousness (David Hawkins' Map of Consciousness principles), focusing on typical reactions/interactions.
Formulate the first multiple-choice question (3-4 options) that logically follows from their description or explores an interesting aspect.
Questions should become progressively more specific.
Response JSON: {"question": "...", "choices": ["...", "..."], "isFinal": false}
Do not include any text outside of this JSON object. No markdown.`;
    } else { // Pure Q&A mode
      prompt = `You are an AI assistant for MBTI & personality assessment.
${langInstruction}
Goal: Understand user deeply via multiple-choice Q&A. Estimate consciousness level (David Hawkins' Map) based on reactions/interactions.
Ask an engaging first question (3-4 multiple choice options). Questions adapt to answers.
Response JSON: {"question": "...", "choices": ["...", "..."], "isFinal": false}
Do not include any text outside of this JSON object. No markdown.`;
    }
  } else { // Subsequent questions
    const lastEntry = history[history.length -1];
    prompt = `You are an AI for MBTI & personality assessment.
${langInstruction}
Initial Description (if any): "${initialDescription || 'Not provided'}"
Conversation History (in ${languageCode}):
${qnaHistoryString}

User just answered "${lastEntry.answer}" to question "${lastEntry.question}".
Formulate the next relevant multiple-choice question (3-4 options) in ${languageCode} for MBTI traits and consciousness level.
If you have enough information for a full analysis (MBTI, consciousness, detailed New Age advice), set "isFinal" to true and omit "question" and "choices".
Otherwise, provide the next question.
Response JSON: {"question": "...", "choices": ["...", "..."], "isFinal": boolean} or {"isFinal": true}
Do not include any text outside of this JSON object. No markdown.`;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: [{ role: "user", parts: [{text: prompt}]}],
      config: {
        responseMimeType: "application/json",
        temperature: 0.6, 
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


  const prompt = `You are an expert MBTI analyst, career counselor, and personal development coach.
${langInstruction}
The user has completed a Q&A session.
User's initial self-description (if provided, language may vary, but your output must be in ${languageCode}): "${initialDescription || 'Not provided'}"

Q&A History (conducted in ${languageCode}):
${qnaHistoryString}

Based on the initial description (if provided) and the entire Q&A history, provide a comprehensive analysis.
Estimate the user's general level of consciousness based on David Hawkins' Map of Consciousness, informed by their responses about daily interactions and emotional patterns. Explain your reasoning briefly.
Provide more in-depth and personalized New Age suggestions for this user.

Format response strictly as a JSON object with keys:
- "mbtiType": string
- "personalitySummary": string (concise summary from Q&A)
- "mbtiExplanation": string (MBTI fit from Q&A)
- "careerSuggestions": array of strings (3-5)
- "organizationalRoles": array of strings (2-3)
- "educationalAdvice": string
- "dailyLifeTips": string
- "hawkinsInsight": string (core Hawkins insight)
- "consciousnessLevelPrediction": string (e.g., "Courage with Pride tendencies", "Operates at Reason, exploring Love" - include brief justification)
- "newAgeConcept": string (primary New Age concept)
- "detailedNewAgeSuggestions": array of strings (2-3 actionable, personalized New Age practices)
- "language": string (The ISO 639-1 code of the language used for this response, MUST BE "${languageCode}")

Example for "language" field: "language": "${languageCode}"
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
    
    if (!parsedData.mbtiType || !parsedData.consciousnessLevelPrediction || !parsedData.detailedNewAgeSuggestions || !parsedData.language) {
        throw new Error("Received incomplete or malformed data from AI for Q&A analysis.");
    }
    // Ensure the language field from AI matches requested, or handle discrepancy
    if (parsedData.language !== languageCode) {
        console.warn(`AI responded in ${parsedData.language} but ${languageCode} was requested. Using AI's reported language.`);
        // Potentially override: parsedData.language = languageCode; if strict adherence is needed
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
- MBTI Type: ${result.mbtiType}
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
1.  Leveraging their core ${result.mbtiType} strengths for specific goals.
2.  Addressing potential blind spots or challenges typical for ${result.mbtiType}.
3.  Practical exercises or reflection prompts related to their Hawkins insight or consciousness level.
4.  Ways to integrate their suggested New Age concept or practices more deeply.
5.  Tips for developing "untapped potential".

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
