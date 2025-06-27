
import { MbtiResult, QnAStep, QnAHistoryItem } from '../types';

async function callApi(action: string, payload: any) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    // We need to handle non-JSON error responses gracefully
    let data;
    try {
        data = await response.json();
    } catch (e) {
        // This happens if the server returns HTML (like a 404 page) instead of JSON
        if (!response.ok) {
            throw new Error(`The API endpoint is not available (Status: ${response.status}). If running locally, please note this application now uses a backend function which requires a special development server (like 'vercel dev') to run.`);
        }
        // If response was OK but JSON parsing failed, that's a different issue.
        throw new Error("Failed to parse a response from the server. The response was not valid JSON.");
    }

    if (!response.ok) {
        // Now we know 'data' is a valid JSON object with an error message from our backend
        throw new Error(data.error || `The server returned an error (Status: ${response.status}). Check the Vercel logs for more details.`);
    }

    return data;
}

export const processSelfDescription = async (userInput: string, languageCode: string = 'en'): Promise<MbtiResult> => {
  return callApi('processSelfDescription', { userInput, languageCode });
};

export const startOrContinueQnA = async (languageCode: string, initialDescription?: string, history: QnAHistoryItem[] = []): Promise<QnAStep> => {
  return callApi('startOrContinueQnA', { languageCode, initialDescription, history });
};

export const getAnalysisFromQnA = async (languageCode: string, initialDescription?: string, history: QnAHistoryItem[] = []): Promise<MbtiResult> => {
  return callApi('getAnalysisFromQnA', { languageCode, initialDescription, history });
};

export const getDetailedMbtiExploration = async (mbtiType: string, personalitySummary: string, languageCode: string): Promise<string> => {
  return callApi('getDetailedMbtiExploration', { mbtiType, personalitySummary, languageCode });
};

export const getDevelopmentStrategies = async (result: MbtiResult, languageCode: string): Promise<string> => {
  return callApi('getDevelopmentStrategies', { result, languageCode });
};
