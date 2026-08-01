const HANDLE = 'tarun0809';

module.exports = async (req, res) => {
  try {
    const r = await fetch(`https://atcoder.jp/users/${HANDLE}/history/json`);
    const history = await r.json();
    const rated = history.filter((h) => h.IsRated);

    const rating = rated.length ? rated[rated.length - 1].NewRating : null;
    const maxRating = rated.length ? Math.max(...rated.map((h) => h.NewRating)) : null;

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({
      rating,
      maxRating,
      contests: rated.length,
    });
  } catch (err) {
    res.status(200).json({ error: true, message: err.message });
  }
};
