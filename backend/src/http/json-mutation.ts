import express, {type RequestHandler} from 'express';
import {HttpBoundaryError} from './http-error';

export const jsonMutation: RequestHandler[] = [
    (req, _res, next) => {
        if (!req.is('application/json')) {
            next(new HttpBoundaryError('UNSUPPORTED_MEDIA_TYPE', 415, 'Content-Type must be application/json.'));
        }

        return next();
    },
    express.json({limit: 16 * 1024, strict: true, inflate: false}),
];
