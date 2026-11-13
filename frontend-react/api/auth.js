export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { key } = req.body;
      const validKey = process.env.ADMIN_KEY || 'admin123';
      
      if (key === validKey) {
        return res.status(200).json({ success: true, token: 'ah-session-' + Date.now() });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid Access Key' });
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
