const SENSITIVE_KEY =
    /(authorization|cookie|token|secret|password|credential|api[-_]?key|private[-_]?key|client[-_]?secret|admin[-_]?token|csrf|refresh|access)/i;

function redactString(value: string): string {
    return value
        .replace(/\b(Bearer|Basic)\s+[^\s,;]+/gi, '$1 [REDACTED]')
        .replace(
            /((?:\?|&)(?:token|access_token|refresh_token|password|secret|code|key|authorization|signature)=)[^&\s]+/gi,
            '$1[REDACTED]',
        )
        .replace(/(password-reset\/)[^/?\s]+/gi, '$1[REDACTED]')
        .replace(/(-----BEGIN [^-]+-----)[\s\S]*?(-----END [^-]+-----)/g, '$1[REDACTED]$2');
}

/** Additional defense for known credential patterns; log only explicitly allowed data. */
export function redactSensitive(value: unknown, seen = new WeakSet<object>()): unknown {
    if (typeof value === 'string') {
        return redactString(value);
    }

    if (value === null || value === undefined || typeof value !== 'object') {
        return value;
    }

    if (seen.has(value)) {
        return '[Circular]';
    }

    seen.add(value);

    if (value instanceof Error) {
        return {
            name: value.name,
            message: redactString(value.message),
            stack: value.stack ? redactString(value.stack) : undefined,
        };
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (Array.isArray(value)) {
        return value.map((item) => redactSensitive(item, seen));
    }

    const output: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
        output[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactSensitive(child, seen);
    }
    return output;
}
