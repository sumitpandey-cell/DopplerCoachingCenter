import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    message: 'Environment variables debug',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'NOT_SET',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT_SET',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? `${process.env.FIREBASE_PRIVATE_KEY.length} chars` : 'NOT_SET',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    cwd: process.cwd(),
  });
} 