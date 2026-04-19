const axios = require('axios');

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-3-mini';

async function callGrok(systemPrompt, userPrompt, maxTokens = 300) {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey || apiKey === 'your_grok_api_key_here') {
    return null;
  }

  const response = await axios.post(
    GROK_API_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    },
  );

  return response.data.choices?.[0]?.message?.content || null;
}

async function summarize(text) {
  if (!text || text.length < 50) return null;

  try {
    return await callGrok(
      'You are a gaming news summarizer. Provide concise, engaging summaries of gaming content in 2-3 sentences. Focus on what matters to players.',
      `Summarize this gaming content:\n\n${text.slice(0, 2000)}`,
      200,
    );
  } catch (err) {
    console.error('[Grok] Summarize failed:', err.message);
    return null;
  }
}

async function translate(text, fromLang = 'Chinese', toLang = 'English') {
  if (!text) return null;

  try {
    return await callGrok(
      `Translate the following ${fromLang} gaming content to ${toLang}. Keep gaming terminology, character names, and game-specific terms intact. Be natural and concise.`,
      text.slice(0, 3000),
      500,
    );
  } catch (err) {
    console.error('[Grok] Translate failed:', err.message);
    return null;
  }
}

async function generatePulse(articles, gameName) {
  if (!articles || articles.length === 0) return null;

  const titles = articles
    .slice(0, 15)
    .map(a => `- ${a.title}`)
    .join('\n');

  try {
    return await callGrok(
      'You are a gaming community analyst. Write a brief, engaging "Community Pulse" summary (3-4 sentences) that captures what the community is buzzing about. Write in a casual, insider tone — like a friend catching you up.',
      `Here are the latest headlines and posts for ${gameName}:\n\n${titles}`,
      250,
    );
  } catch (err) {
    console.error('[Grok] Pulse generation failed:', err.message);
    return null;
  }
}

module.exports = { summarize, translate, generatePulse };
