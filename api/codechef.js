const HANDLE = 'nifty_feat_32';

module.exports = async (req, res) => {
  try {
    const r = await fetch(`https://www.codechef.com/users/${HANDLE}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)' },
    });
    const html = await r.text();

    const ratingMatch = html.match(/<div class="rating-number">\s*([\d]+)/);
    const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : null;

    const starMatch = html.match(/(\d)\s*★/);
    const stars = starMatch ? `${starMatch[1]}★` : null;

    let maxRating = null;
    const allRatingMatch = html.match(/var all_rating = (\[.*?\]);/s);
    if (allRatingMatch) {
      const parsed = JSON.parse(allRatingMatch[1]);
      maxRating = Math.max(...parsed.map((entry) => parseInt(entry.rating, 10)));
    }

    if (rating === null) throw new Error('Could not parse CodeChef profile');

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ rating, stars, maxRating });
  } catch (err) {
    res.status(200).json({ error: true, message: err.message });
  }
};
