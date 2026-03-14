const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// POST /api/ai-chat
// Body: { message: "user's question" }
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    // Prefer Anthropic (Claude Haiku 4.5) when configured for all clients
    const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_HAIKU_API_KEY;
    if (ANTHROPIC_KEY) {
      try {
        const anthropicResp = await axios.post(
          // Use the general Anthropic completions endpoint. Model name 'claude-haiku-4.5' will be used when available.
          'https://api.anthropic.com/v1/complete',
          {
            model: 'claude-haiku-4.5',
            prompt: message,
            max_tokens_to_sample: 1000
          },
          {
            headers: {
              'x-api-key': ANTHROPIC_KEY,
              'Content-Type': 'application/json'
            },
            timeout: 60000
          }
        );

        console.log('Anthropic response:', JSON.stringify(anthropicResp.data));
        // Anthropic may return different shapes: check common ones
        let reply = 'Sorry, no response.';
        if (anthropicResp.data?.completion) reply = anthropicResp.data.completion;
        else if (anthropicResp.data?.completion?.[0]) reply = anthropicResp.data.completion[0];
        else if (anthropicResp.data?.result) reply = anthropicResp.data.result;
        else if (anthropicResp.data?.output) reply = anthropicResp.data.output;

        return res.json({ reply });
      } catch (innerErr) {
        console.warn('Anthropic call failed, falling back to Hugging Face:', innerErr.response?.data || innerErr.message);
        // fall through to Hugging Face fallback
      }
    }

    // Hugging Face Inference API (text-generation) fallback
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!HF_API_KEY) {
      return res.status(500).json({ error: 'No AI provider configured (Anthropic or Hugging Face API key missing).' });
    }

    const hfResponse = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      { inputs: message },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );
    console.log('Hugging Face API response:', JSON.stringify(hfResponse.data));
    let aiReply = 'Sorry, no response.';
    if (Array.isArray(hfResponse.data) && hfResponse.data[0]?.generated_text) {
      aiReply = hfResponse.data[0].generated_text;
    } else if (hfResponse.data.generated_text) {
      aiReply = hfResponse.data.generated_text;
    } else if (hfResponse.data.error) {
      aiReply = `Error: ${hfResponse.data.error}`;
    }
    res.json({ reply: aiReply });
  } catch (err) {
    console.error('AI chat error:', err.message, err.response?.data);
    res.status(500).json({ error: 'AI chat service unavailable.' });
  }
});

module.exports = router;
