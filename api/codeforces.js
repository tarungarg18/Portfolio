const HANDLE = 'tara0809';

module.exports = async (req, res) => {
  try {
    const [infoRes, statusRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${HANDLE}`),
      fetch(`https://codeforces.com/api/user.status?handle=${HANDLE}`),
    ]);
    const data = await infoRes.json();
    if (data.status !== 'OK') throw new Error('Codeforces API returned an error');

    const user = data.result[0];
    const rank = user.rank ? user.rank.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unrated';

    let solved = null;
    const statusData = await statusRes.json();
    if (statusData.status === 'OK') {
      const solvedSet = new Set();
      statusData.result.forEach((sub) => {
        if (sub.verdict === 'OK') solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`);
      });
      solved = solvedSet.size;
    }

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({
      rank,
      rating: user.rating ?? null,
      maxRating: user.maxRating ?? null,
      solved,
    });
  } catch (err) {
    res.status(200).json({ error: true, message: err.message });
  }
};
