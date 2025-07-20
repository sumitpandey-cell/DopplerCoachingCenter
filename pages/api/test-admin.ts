import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // First, let's check if we can access the adminDb
    console.log('Testing Firebase Admin SDK access...');
    
    // Test basic Firestore access
    const testCollection = adminDb.collection('test');
    console.log('Successfully created test collection reference');
    
    const testDoc = await testCollection.add({
      test: true,
      timestamp: new Date()
    });
    console.log('Successfully created test document with ID:', testDoc.id);
    
    // Clean up test document
    await testDoc.delete();
    console.log('Successfully deleted test document');
    
    res.status(200).json({
      success: true,
      message: 'Firebase Admin SDK is working correctly',
      testDocumentId: testDoc.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin SDK test error:', error);
    
    // Provide more detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      code: (error as any)?.code || 'UNKNOWN',
      details: (error as any)?.details || 'No additional details'
    };
    
    res.status(500).json({
      success: false,
      error: 'Firebase Admin SDK test failed',
      details: errorDetails.message,
      errorInfo: errorDetails
    });
  }
} 