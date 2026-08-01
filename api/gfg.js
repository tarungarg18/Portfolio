const HANDLE = 'tarunga9frs';

module.exports = async (req, res) => {
  try {
    const r = await fetch(`https://www.geeksforgeeks.org/profile/${HANDLE}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)' },
    });
    const html = await r.text();

    const scoreMatch = html.match(/"score"\s*:\s*(\d+)/);
    const solvedMatch = html.match(/"total_problems_solved"\s*:\s*(\d+)/);

    if (!scoreMatch && !solvedMatch) throw new Error('Could not parse GFG profile stats');

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({
      solved: solvedMatch ? parseInt(solvedMatch[1], 10) : null,
      score: scoreMatch ? parseInt(scoreMatch[1], 10) : null,
    });
  } catch (err) {
    res.status(200).json({ error: true, message: err.message });
  }
};
