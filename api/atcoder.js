const HANDLE = 'tarun0809';

module.exports = async (req, res) => {
  try {
    const [historyRes, solvedRes] = await Promise.all([
      fetch(`https://atcoder.jp/users/${HANDLE}/history/json`),
      fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${HANDLE}`),
    ]);
    const history = await historyRes.json();
    const rated = history.filter((h) => h.IsRated);

    const rating = rated.length ? rated[rated.length - 1].NewRating : null;
    const maxRating = rated.length ? Math.max(...rated.map((h) => h.NewRating)) : null;

    let solved = null;
    try {
      const solvedData = await solvedRes.json();
      solved = typeof solvedData.count === 'number' ? solvedData.count : null;
    } catch (e) {
      // solved-count service unavailable — leave null
    }

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({
      rating,
      maxRating,
      solved,
    });
  } catch (err) {
    res.status(200).json({ error: true, message: err.message });
  }
};
