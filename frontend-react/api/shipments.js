import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const id = req.query.id;
      const shipments = await kv.get('allcargo_shipments') || [];
      
      if (id) {
        const shipment = shipments.find(s => s.id === id);
        if (shipment) {
          return res.status(200).json(shipment);
        } else {
          return res.status(404).json({ error: 'Not Found' });
        }
      }
      
      return res.status(200).json(shipments);
    }
    
    if (req.method === 'POST') {
      const shipments = req.body;
      if (!Array.isArray(shipments)) {
        return res.status(400).json({ error: 'Body must be an array of shipments' });
      }
      
      await kv.set('allcargo_shipments', shipments);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error("KV Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
