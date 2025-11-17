const axios = require('axios');

/**
 * AI Service for generating daily crypto insights
 * Uses OpenRouter API (free tier available)
 * Alternative: Hugging Face Inference API
 */

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

/**
 * Generate AI insight based on user preferences
 * @param {Object} userPreferences - User's preferences
 * @param {string[]} userPreferences.interestedAssets - User's crypto interests
 * @param {string} userPreferences.investorType - User's investor type
 * @param {string[]} userPreferences.contentTypes - Preferred content types
 * @returns {Promise<Object>} AI-generated insight
 */
async function generateInsight(userPreferences) {
  try {
    const { interestedAssets, investorType, contentTypes } = userPreferences;

    // Build prompt based on user preferences
    const prompt = `Generate a brief (2-3 sentences) daily crypto insight for a ${investorType} investor interested in ${interestedAssets.join(', ')}. 
    Focus on: ${contentTypes.join(', ')}. 
    Keep it informative, concise, and relevant to today's market.`;

    // Use OpenRouter API
    // Free models available: meta-llama/llama-3.2-3b-instruct, google/gemini-flash-1.5
    const response = await axios.post(
      `${OPENROUTER_API_BASE}/chat/completions`,
      {
        model: 'meta-llama/llama-3.2-3b-instruct', // Free model
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful crypto market analyst. Provide concise, actionable insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const insight =
      response.data.choices[0]?.message?.content ||
      'Market analysis is currently unavailable.';

    return {
      insight,
      generatedAt: new Date().toISOString(),
      model: response.data.model || 'llama-3.2',
    };
  } catch (error) {

    // Fallback insight if API fails
    const fallbackInsights = [
      `As a ${userPreferences.investorType}, keep an eye on ${userPreferences.interestedAssets.join(' and ')}. Market conditions are dynamic, so stay informed and make decisions based on your risk tolerance.`,
      `Today's crypto market shows interesting movements in ${userPreferences.interestedAssets.join(', ')}. ${userPreferences.investorType}s should monitor these assets closely.`,
      `For ${userPreferences.investorType}s interested in ${userPreferences.interestedAssets.join(' and ')}, staying updated with ${userPreferences.contentTypes.join(' and ')} content is key to making informed decisions.`,
    ];

    return {
      insight:
        fallbackInsights[
          Math.floor(Math.random() * fallbackInsights.length)
        ],
      generatedAt: new Date().toISOString(),
      model: 'fallback',
      error: 'Using fallback insight',
    };
  }
}

/**
 * Alternative: Use Hugging Face Inference API (free, no key needed for some models)
 */
async function generateInsightHuggingFace(userPreferences) {
  try {
    const { interestedAssets, investorType } = userPreferences;

    const prompt = `Daily crypto insight for ${investorType} interested in ${interestedAssets.join(', ')}:`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        inputs: prompt,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      insight: response.data.generated_text || 'Market insight unavailable.',
      generatedAt: new Date().toISOString(),
      model: 'huggingface',
    };
  } catch (error) {
    return generateInsight(userPreferences); // Fallback to OpenRouter
  }
}

module.exports = {
  generateInsight,
  generateInsightHuggingFace,
};

