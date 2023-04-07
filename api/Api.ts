import axios from 'axios';
import _ from 'lodash';

import { Complaint, Report } from 'utils/constants';

export async function post<T>(endpoint: string, data: T, apiKey: string): Promise<any> {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, data, {
    headers: { 'X-API-KEY': apiKey },
  });
  return response.data;
}

export async function getComplaints(
  problem: string,
  keyWords: string[],
  apiKey: string,
): Promise<Complaint[]> {
  return await post(
    'complaints',
    {
      filtering: {
        problem,
        key_words: keyWords,
        threshold: 2,
        percentages: [0.4, 0.6, 0],
      },
    },
    apiKey,
  );
}

export async function getReports(
  problem: string,
  keyWords: string[],
  threshold: number,
  apiKey: string,
): Promise<Report[]> {
  const response = await post(
    'reports',
    {
      filtering: {
        problem,
        key_words: keyWords,
        threshold,
        percentages: [0.4, 0.6, 0],
      },
    },
    apiKey,
  );
  return response.map((x: any) => ({
    ...x,
    score: _.mean(x.score),
    scores: x.score,
  }));
}

export async function generateReport(reportIds: string[], apiKey: string): Promise<string> {
  return await post(
    'reports/generate',
    {
      report_ids: reportIds,
    },
    apiKey,
  );
}

export async function sendChatMessage(
  message: string,
  reportIds: string[],
  apiKey: string,
): Promise<string> {
  return await post('chat/message', { message, report_ids: reportIds }, apiKey);
}

export async function getChatMessages(
  reportIds: string[],
  apiKey: string,
): Promise<[string, string][]> {
  return await post(
    'chat/history',
    {
      report_ids: reportIds,
    },
    apiKey,
  );
}

export async function deleteMessages(reportIds: string[], apiKey: string): Promise<void> {
  await post('chat/clear', { report_ids: reportIds }, apiKey);
}
