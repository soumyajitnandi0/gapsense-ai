import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY;

export const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

export const groqModel = 'llama-3.1-8b-instant'; // Fast, cheap model for simple tasks
export const groqProModel = 'llama-3.3-70b-versatile'; // Better quality for complex tasks
export const groqCodeModel = 'codellama-34b-instruct'; // Code-specific tasks

export default groq;
