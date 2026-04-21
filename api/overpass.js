export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lng, radius = 40 } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat, lng required' });

  const query = `[out:json][timeout:10];(node["name"](around:${radius},${lat},${lng});way["name"](around:${radius},${lat},${lng}););out body;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query)
    });

    if (!response.ok) return res.status(response.status).json({ error: 'Overpass error' });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
}
