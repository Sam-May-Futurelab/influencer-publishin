// Shared CORS configuration for all API endpoints
// Only allows requests from the production frontend domain

const ALLOWED_ORIGINS = [
  'https://inkfluenceai.com',
  'https://www.inkfluenceai.com',
  'http://localhost:5173', // Local development
  'http://localhost:4173'  // Local preview
];

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  
  // Check if the request origin is in the allowed list
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback to production domain (will fail if origin doesn't match)
    res.setHeader('Access-Control-Allow-Origin', 'https://inkfluenceai.com');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
}

export function handleCorsPreFlight(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(200).end();
    return true;
  }
  return false;
}
