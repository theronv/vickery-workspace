// Vercel serverless function entry point
import app from '../src/index'

export const config = {
  runtime: 'edge'
}

export default app
