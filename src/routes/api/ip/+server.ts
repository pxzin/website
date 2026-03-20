import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

function getAllowedOrigins(requestOrigin: string): string[] {
	const envOrigins = env.ALLOWED_ORIGINS;
	if (envOrigins) {
		return envOrigins.split(',').map((o) => o.trim()).filter(Boolean);
	}
	return [requestOrigin];
}

function corsHeaders(origin: string): Record<string, string> {
	return {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Max-Age': '86400'
	};
}

function getClientIp(event: Parameters<RequestHandler>[0]): string {
	const cfIp = event.request.headers.get('CF-Connecting-IP');
	if (cfIp) return cfIp;

	const xForwardedFor = event.request.headers.get('X-Forwarded-For');
	if (xForwardedFor) return xForwardedFor.split(',')[0].trim();

	const xRealIp = event.request.headers.get('X-Real-IP');
	if (xRealIp) return xRealIp;

	return event.getClientAddress();
}

export const OPTIONS: RequestHandler = async (event) => {
	const origin = event.request.headers.get('Origin');

	if (!origin) {
		return new Response(null, { status: 204 });
	}

	const allowed = getAllowedOrigins(event.url.origin);
	if (!allowed.includes(origin)) {
		return new Response('Forbidden', { status: 403 });
	}

	return new Response(null, {
		status: 204,
		headers: corsHeaders(origin)
	});
};

export const GET: RequestHandler = async (event) => {
	const origin = event.request.headers.get('Origin');

	if (origin) {
		const allowed = getAllowedOrigins(event.url.origin);
		if (!allowed.includes(origin)) {
			return new Response(JSON.stringify({ error: 'Forbidden' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	const ip = getClientIp(event);

	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	if (origin) {
		Object.assign(headers, corsHeaders(origin));
	}

	return new Response(JSON.stringify({ ip }), {
		status: 200,
		headers
	});
};
