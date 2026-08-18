import { RekognitionClient } from '@aws-sdk/client-rekognition';
import { TextractClient } from '@aws-sdk/client-textract';

const region = process.env.AWS_REGION || 'us-east-1';

export const textractClient = new TextractClient({ region });
export const rekognitionClient = new RekognitionClient({ region });
