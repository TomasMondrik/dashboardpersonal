const http = require('node:http');

const PORT = 3000;
const GEMINI_MODEL = 'gemini-3-flash-preview';

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });
  response.end(JSON.stringify(body));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== 'POST' || request.url !== '/api/gemini') {
    sendJson(response, 404, { error: 'Not found' });
    return;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    sendJson(response, 500, { error: 'GEMINI_API_KEY is not configured' });
    return;
  }

  try {
    const payload = JSON.parse(await readRequestBody(request));
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const responseText = await geminiResponse.text();
    response.writeHead(geminiResponse.status, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
    response.end(responseText);
  } catch (error) {
    console.error('Gemini proxy error:', error);
    sendJson(response, 400, { error: 'Invalid request' });
  }
});

server.listen(PORT, () => {
  console.log(`Gemini proxy running at http://localhost:${PORT}/api/gemini`);
});