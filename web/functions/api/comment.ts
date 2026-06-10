/**
 * Comment Submission API Endpoint
 *
 * NON-PORTABLE BOUNDARY
 * =====================
 * This is the ONLY non-portable file in the YOW codebase.
 * Runtime: Cloudflare Pages Functions
 *
 * When deploying to a static-only host:
 * - Set PUBLIC_ENABLE_COMMENTS=false in environment
 * - Comment UI will not render
 * - This file will not be invoked
 *
 * See: docs/architecture/ADR-YOW-003-comment-isolation.md
 * See: docs/deployer-guide.md §Comments
 *
 * ENDPOINT CONTRACT
 * =================
 * Method: POST (form-encoded)
 *
 * Request Fields:
 *   - name*: string (required) - Commenter's name
 *   - email: string (optional) - Commenter's email
 *   - comment*: string (required, max 2000 chars) - Comment text
 *   - page: string (optional, default: "testimonials") - Source page
 *   - website: string (honeypot) - If filled, submission silently discarded
 *
 * Behavior:
 *   - Honeypot filled → 200 OK (silent discard)
 *   - Spam patterns detected → 200 OK (silent discard)
 *   - Validation failure → 400 Bad Request (JSON error)
 *   - Success → Creates Sanity comment with approved: false
 *   - Success → 303 redirect to /testimonials?submitted=true
 *
 * Implementation Tasks:
 * - Task #3: Basic endpoint - accepts POST, returns redirect
 * - Task #4: Input validation
 * - Task #5: Spam detection
 * - Task #6: Sanity integration
 */

interface Env {
  PUBLIC_SANITY_PROJECT_ID: string;
  PUBLIC_SANITY_DATASET: string;
  PUBLIC_SANITY_API_VERSION?: string;
  SANITY_API_TOKEN: string;
}

interface Context {
  request: Request;
  env: Env;
}

// Handle POST requests
export async function onRequestPost(context: Context): Promise<Response> {
  const { request, env } = context;

  // Parse form data
  const formData = await request.formData();
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const comment = formData.get('comment')?.toString().trim();
  const page = formData.get('page')?.toString() || 'testimonials';
  const honeypot = formData.get('website')?.toString();

  // Honeypot check (bot detection) - silent reject
  if (honeypot) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate required fields
  if (!name) {
    return new Response(JSON.stringify({ error: 'Name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!comment) {
    return new Response(JSON.stringify({ error: 'Comment is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Comment length check
  if (comment.length > 2000) {
    return new Response(JSON.stringify({ error: 'Comment too long (max 2000 characters)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Spam pattern detection - silent reject
  const spamPatterns = [
    /https?:\/\/.*https?:\/\//i,  // Multiple URLs
    /<script/i,                    // Script tags
    /viagra|casino|crypto/i,       // Spam keywords
  ];
  if (spamPatterns.some(pattern => pattern.test(comment))) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create document in Sanity
  const sanityDoc = {
    _type: 'comment',
    name,
    email: email || undefined,
    comment,
    page,
    submittedAt: new Date().toISOString(),
    approved: false,
  };

  // Fail-fast validation
  if (!env.PUBLIC_SANITY_PROJECT_ID) {
    return new Response(JSON.stringify({ error: 'Missing PUBLIC_SANITY_PROJECT_ID' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!env.PUBLIC_SANITY_DATASET) {
    return new Response(JSON.stringify({ error: 'Missing PUBLIC_SANITY_DATASET' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!env.SANITY_API_TOKEN) {
    return new Response(JSON.stringify({ error: 'Missing SANITY_API_TOKEN' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiVersion = env.PUBLIC_SANITY_API_VERSION || '2024-01-01';

  const sanityResponse = await fetch(
    `https://${env.PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${apiVersion}/data/mutate/${env.PUBLIC_SANITY_DATASET}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SANITY_API_TOKEN}`,
      },
      body: JSON.stringify({
        mutations: [{ create: sanityDoc }],
      }),
    }
  );

  if (!sanityResponse.ok) {
    console.error('Sanity error:', await sanityResponse.text());
    return new Response(JSON.stringify({ error: 'Failed to save comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Redirect back to testimonials page with success message
  const origin = new URL(request.url).origin;
  return Response.redirect(`${origin}/testimonials?submitted=true`, 303);
}

// Handle GET and other methods - return 405
export async function onRequestGet(): Promise<Response> {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST',
    },
  });
}
