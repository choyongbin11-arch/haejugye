// Vercel 서버 함수: /api/quote?symbol=AAPL&range=2y&interval=1d
// Yahoo Finance 차트 데이터를 받아 브라우저에 전달 (브라우저에서 직접 부르면 CORS로 막힘)
module.exports = async (req, res) => {
  const { symbol = '', range = '2y', interval = '1d' } = req.query || {};
  if (!/^[A-Za-z0-9.\-=^]{1,20}$/.test(symbol) || !/^[0-9a-z]{1,5}$/.test(range) || !/^[0-9a-z]{1,4}$/.test(interval)) {
    res.status(400).json({ error: 'bad parameters' });
    return;
  }
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 haejugye' } });
    const body = await r.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    // Vercel 엣지에서 30초 캐시 → 사용자가 많아도 Yahoo 호출 수가 적게 유지됨
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    res.status(r.ok ? 200 : 502).send(r.ok ? body : JSON.stringify({ error: 'upstream ' + r.status }));
  } catch (e) {
    res.status(502).json({ error: 'upstream failed' });
  }
};
