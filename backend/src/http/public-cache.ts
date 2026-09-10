import {createHash} from 'node:crypto';
import type {Request, Response} from 'express';
export function sendPublicJson(req: Request, res: Response, value: unknown, lastModified?: string) {
    const etag = '"' + createHash('sha256').update(JSON.stringify(value)).digest('base64url') + '"';
    res.set('Cache-Control', 'public, max-age=0, s-maxage=60, must-revalidate').set('ETag', etag);
    if (lastModified) res.set('Last-Modified', new Date(lastModified).toUTCString());
    const condition = req.headers['if-none-match'];
    if (condition !== undefined) {
        if (condition.split(',').some((candidate) => candidate.trim() === '*' || candidate.trim().replace(/^W\//u, '') === etag)) { res.status(304).end(); return; }
    } else if (lastModified && req.headers['if-modified-since']) {
        const since = Date.parse(req.headers['if-modified-since']);
        if (Number.isFinite(since) && Math.floor(Date.parse(lastModified) / 1000) * 1000 <= since) { res.status(304).end(); return; }
    }
    res.json(value);
}
