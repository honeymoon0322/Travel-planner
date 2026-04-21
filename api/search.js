export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, x, y, radius, nearby } = req.query;

  // nearby=1 이면 좌표 주변 가게를 다양한 키워드로 검색해서 합치기
  if (nearby === '1' && x && y) {
    const keywords = ['음식점', '카페', '편의점', '학원', '병원', '약국', '헬스', '미용', '은행', '마트', '옷'];
    const seen = new Set();
    const items = [];

    await Promise.all(keywords.map(async (kw) => {
      const url = new URL('https://openapi.naver.com/v1/search/local.json');
      url.searchParams.set('query', kw);
      url.searchParams.set('display', '5');
      url.searchParams.set('sort', 'random');
      url.searchParams.set('x', x);
      url.searchParams.set('y', y);
      url.searchParams.set('radius', radius || '100');
      try {
        const r = await fetch(url.toString(), {
          headers: {
            'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
          }
        });
        if (!r.ok) return;
        const data = await r.json();
        (data.items || []).forEach(item => {
          const name = item.title.replace(/<[^>]*>/g, '');
          if (!seen.has(name)) {
            seen.add(name);
            items.push(item);
          }
        });
      } catch(e) {}
    }));

    return res.status(200).json({ items });
  }

  if (!q) return res.status(400).json({ error: 'query required' });

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
