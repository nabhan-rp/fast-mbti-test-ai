
import { MbtiResult, QnAStep, QnAHistoryItem } from '../types';

async function callApi(action: string, payload: any) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
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
