import { GoogleGenAI } from "@google/genai";
import type { Risk, Source } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function parseRisks(text: string): Omit<Risk, 'sources' | 'date' | 'link'>[] {
  try {
    const riskBlocks = text.split('---').filter(block => block.trim() !== '');
    return riskBlocks.map(block => {
      const titleMatch = block.match(/Title:\s*(.*)/);
      const summaryMatch = block.match(/Summary:\s*(.*)/);

      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Risk';
      const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available.';

      return { title, summary };
    });
  } catch (error) {
    console.error("Failed to parse risks from response:", error);
    throw new Error("Could not parse the AI's response. The format might have changed.");
  }
}

function parseHeadlines(text: string): Omit<Risk, 'sources'>[] {
  try {
    const headlineBlocks = text.split('---').filter(block => block.trim() !== '');
    return headlineBlocks.map(block => {
      const titleMatch = block.match(/Title:\s*(.*)/);
      const summaryMatch = block.match(/Summary:\s*(.*)/);
      const dateMatch = block.match(/Date:\s*(.*)/);
      const linkMatch = block.match(/Link:\s*(.*)/);

      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Headline';
      const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available.';
      const date = dateMatch ? dateMatch[1].trim() : undefined;
      const link = linkMatch ? linkMatch[1].trim() : undefined;

      return { title, summary, date, link };
    });
  } catch (error) {
    console.error("Failed to parse headlines from response:", error);
    throw new Error("Could not parse the AI's response for headlines. The format might have changed.");
  }
}

async function executeRiskQuery(prompt: string, parser: (text: string) => Omit<Risk, 'sources'>[]): Promise<Risk[]> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const rawText = response.text;
  const parsedItems = parser(rawText);

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources: Source[] = groundingChunks
    .map((chunk: any) => ({
      uri: chunk.web?.uri ?? '',
      title: chunk.web?.title ?? 'Untitled Source',
    }))
    .filter((source: Source) => source.uri);
    
  const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

  if (parsedItems.length === 0) {
    throw new Error("AI returned an empty list of items.");
  }

  return parsedItems.map(item => ({
    ...item,
    sources: uniqueSources,
  }));
}

export async function fetchTrendingRisks(): Promise<Risk[]> {
  try {
    const prompt = `Identify and extract the top 5 trending global news headlines from today relevant to executive decision-makers. For each headline, provide the original title, a one-paragraph summary, its publication date, and a direct link to the article. Format each headline as follows, and separate each with '---':

Title: [The Headline Title]
Summary: [The Headline Summary]
Date: [Publication Date, e.g., YYYY-MM-DD]
Link: [Direct URL to the article]`;
    return await executeRiskQuery(prompt, parseHeadlines);
  } catch (error) {
    console.error("Error fetching trending risks from Gemini API:", error);
    if (error instanceof Error) {
       throw new Error(`Failed to fetch risks: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching risks.");
  }
}

export async function fetchWeeklyRisks(): Promise<Risk[]> {
  try {
    const prompt = `Identify and summarize the top 5 strategic executive risks from the past 7 days, focusing on significant events and emerging trends in geopolitics, macroeconomics, and technology. For each risk, provide a concise title and a one-paragraph summary. Format each risk as follows, and separate each risk with '---':

Title: [The Risk Title]
Summary: [The Risk Summary]`;
    return await executeRiskQuery(prompt, parseRisks);
  } catch (error) {
    console.error("Error fetching weekly risks from Gemini API:", error);
    if (error instanceof Error) {
       throw new Error(`Failed to fetch risks: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching risks.");
  }
}

export async function fetchMonthlyRisks(): Promise<Risk[]> {
  try {
    const prompt = `Identify and summarize the top 5 strategic executive risks from the past 30 days, focusing on major developments and long-term implications in geopolitics, macroeconomics, technological disruption, and climate change. For each risk, provide a concise title and a one-paragraph summary. Format each risk as follows, and separate each risk with '---':

Title: [The Risk Title]
Summary: [The Risk Summary]`;
    return await executeRiskQuery(prompt, parseRisks);
  } catch (error) {
    console.error("Error fetching monthly risks from Gemini API:", error);
    if (error instanceof Error) {
       throw new Error(`Failed to fetch risks: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching risks.");
  }
}

export async function fetchYearlyRisks(): Promise<Risk[]> {
  try {
    const prompt = `Identify and summarize the top 5 strategic executive risks for the current year, focusing on long-term trends in geopolitics, macroeconomics, technological disruption, climate change, and social shifts. For each risk, provide a concise title and a one-paragraph summary. Format each risk as follows, and separate each risk with '---':

Title: [The Risk Title]
Summary: [The Risk Summary]`;
    return await executeRiskQuery(prompt, parseRisks);
  } catch (error) {
    console.error("Error fetching yearly risks from Gemini API:", error);
    if (error instanceof Error) {
       throw new Error(`Failed to fetch risks: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching risks.");
  }
}

export async function fetchFraudEvents(): Promise<Risk[]> {
  try {
    const prompt = `Identify and list the most newsworthy corporate or financial fraud events primarily related to the US that have occurred or come to light this year. For each event, provide a title identifying the event and a concise one-sentence summary of the incident. Format each event as follows, and separate each with '---':

Title: [The Fraud Event Title, e.g., "Company X Accounting Scandal"]
Summary: [A single sentence summarizing the fraud.]`;
    return await executeRiskQuery(prompt, parseRisks);
  } catch (error) {
    console.error("Error fetching fraud events from Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch fraud events: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching fraud events.");
  }
}

export async function fetchCybersecurityIncidents(): Promise<Risk[]> {
  try {
    const prompt = `Identify and list the most newsworthy cybersecurity incidents (e.g., data breaches, ransomware attacks) that have occurred or been disclosed this year. For each incident, provide a title identifying the event and a concise one-sentence summary. Format each event as follows, and separate each with '---':

Title: [The Incident Title, e.g., "Tech Giant Data Breach"]
Summary: [A single sentence summarizing the incident.]`;
    return await executeRiskQuery(prompt, parseRisks);
  } catch (error) {
    console.error("Error fetching cybersecurity incidents from Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch cybersecurity incidents: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching cybersecurity incidents.");
  }
}