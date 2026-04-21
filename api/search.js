export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, x, y, radius } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  // 좌표가 있으면 좌표 기반 검색, 없으면 일반 검색
  const url = new URL('https://openapi.naver.com/v1/search/local.json');
  url.searchParams.set('query', q);
  url.searchParams.set('display', '10');
  url.searchParams.set('sort', 'random');
  if (x) url.searchParams.set('x', x);
  if (y) url.searchParams.set('y', y);
  if (radius) url.searchParams.set('radius', radius);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
      }
    });
    if (!response.ok) return res.status(response.status).json({ error: 'Naver API error' });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
