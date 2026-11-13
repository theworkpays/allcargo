import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const chats = await kv.get('allcargo_chats') || {};
      return res.status(200).json(chats);
    }
    
    if (req.method === 'POST') {
      const chats = req.body;
      if (typeof chats !== 'object') {
        return res.status(400).json({ error: 'Body must be an object representing chats' });
      }
      
      await kv.set('allcargo_chats', chats);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error("KV Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
