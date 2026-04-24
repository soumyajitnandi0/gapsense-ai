import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY;

export const gemini = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

export const geminiModel = gemini?.getGenerativeModel({ model: 'gemini-1.5-flash' });
export const geminiProModel = gemini?.getGenerativeModel({ model: 'gemini-1.5-pro' });

export default gemini;
