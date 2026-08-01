const HANDLE = 'tara0809';

module.exports = async (req, res) => {
  try {
    const r = await fetch(`https://codeforces.com/api/user.info?handles=${HANDLE}`);
    const data = await r.json();
    if (data.status !== 'OK') throw new Error('Codeforces API returned an error');

    const user = data.result[0];
    const rank = user.rank ? user.rank.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unrated';

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({
      rank,
      rating: user.rating ?? null,
      maxRating: user.maxRating ?? null,
    });
  } catch (err) {
    res.status(200).json({ error: true, message: err.message });
  }
};
