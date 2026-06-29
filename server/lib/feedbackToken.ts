import crypto from "crypto";

/**
 * Magic-link feedback tokens.
 *
 * The token is the recipient's auth — no planner login required. When they
 * click "Approve" or "Request changes" in the reminder email, the URL carries
 * a signed token that proves the planner generated it for this specific
 * (selection, action, user) tuple.
 *
 * Format: `<base64url(payload-json)>.<base64url(hmac-sha256-signature)>`
 *
 * Payload:
 *   sub:    selection_id
 *   action: 'approve' | 'revise'
 *   uid:    recipient user_id (recorded as the actor on the resulting transition)
 *   iat:    issued-at unix seconds
 *   exp:    expiry unix seconds (14 days after iat by default)
 *
 * Signature: HMAC-SHA256 of the payload JSON using FEEDBACK_TOKEN_SECRET.
 *
 * Replay safety is handled by the action endpoint checking the selection is
 * still at `awaitingApproval` before acting — once the status moves, repeated
 * clicks become no-ops.
 */

export type FeedbackAction = "approve" | "revise";

export interface FeedbackTokenPayload {
	sub: string; // selection_id
	action: FeedbackAction;
	uid: string; // recipient user_id
	iat: number; // seconds since epoch
	exp: number; // seconds since epoch
}

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

function getSecret(): string {
	const secret = process.env.FEEDBACK_TOKEN_SECRET;
	if (!secret) {
		throw new Error(
			"FEEDBACK_TOKEN_SECRET env var is not set — required for feedback magic links.",
		);
	}
	return secret;
}

function b64urlEncode(input: Buffer | string): string {
	const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
	return buf
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
}

function b64urlDecode(input: string): Buffer {
	const pad = (4 - (input.length % 4)) % 4;
	const normalised = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
	return Buffer.from(normalised, "base64");
}

function sign(payloadEncoded: string): string {
	const hmac = crypto.createHmac("sha256", getSecret());
	hmac.update(payloadEncoded);
	return b64urlEncode(hmac.digest());
}

export function signFeedbackToken(
	selectionId: string,
	action: FeedbackAction,
	uid: string,
	ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
	const now = Math.floor(Date.now() / 1000);
	const payload: FeedbackTokenPayload = {
		sub: selectionId,
		action,
		uid,
		iat: now,
		exp: now + ttlSeconds,
	};
	const payloadEncoded = b64urlEncode(JSON.stringify(payload));
	const signature = sign(payloadEncoded);
	return `${payloadEncoded}.${signature}`;
}

export type VerifyResult =
	| { ok: true; payload: FeedbackTokenPayload }
	| { ok: false; reason: "malformed" | "bad_signature" | "expired" };

export function verifyFeedbackToken(token: string): VerifyResult {
	const parts = token.split(".");
	if (parts.length !== 2) return { ok: false, reason: "malformed" };
	const [payloadEncoded, signature] = parts;
	if (!payloadEncoded || !signature) return { ok: false, reason: "malformed" };

	let expectedSig: string;
	try {
		expectedSig = sign(payloadEncoded);
	} catch {
		return { ok: false, reason: "malformed" };
	}

	// Constant-time comparison to avoid timing leaks.
	const a = Buffer.from(signature);
	const b = Buffer.from(expectedSig);
	if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
		return { ok: false, reason: "bad_signature" };
	}

	let payload: FeedbackTokenPayload;
	try {
		payload = JSON.parse(b64urlDecode(payloadEncoded).toString("utf8"));
	} catch {
		return { ok: false, reason: "malformed" };
	}

	if (!payload.sub || !payload.action || !payload.uid || !payload.exp) {
		return { ok: false, reason: "malformed" };
	}
	if (payload.action !== "approve" && payload.action !== "revise") {
		return { ok: false, reason: "malformed" };
	}

	const now = Math.floor(Date.now() / 1000);
	if (payload.exp < now) {
		return { ok: false, reason: "expired" };
	}

	return { ok: true, payload };
}
