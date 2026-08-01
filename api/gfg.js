const HANDLE = 'tarunga9frs';

function findFirst(obj, keyPattern, seen = new Set()) {
  if (!obj || typeof obj !== 'object' || seen.has(obj)) return undefined;
  seen.add(obj);
  for (const [key, value] of Object.entries(obj)) {
    if (keyPattern.test(key) && (typeof value === 'number' || typeof value === 'string')) {
      return value;
    }
  }
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      const found = findFirst(value, keyPattern, seen);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

module.exports = async (req, res) => {
  try {
    const r = await fetch(`https://www.geeksforgeeks.org/profile/${HANDLE}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)' },
    });
    const html = await r.text();

    const nextDataMatch = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s
    );
    if (!nextDataMatch) throw new Error('Could not locate profile data on GFG page');

    const data = JSON.parse(nextDataMatch[1]);
    const solved = findFirst(data, /total.*problem.*solved|problems?_solved/i);
    const score = findFirst(data, /coding.*score|score/i);

    if (solved === undefined && score === undefined) {
      throw new Error('Could not parse GFG profile stats');
    }

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({
      solved: solved !== undefined ? Number(solved) : null,
      score: score !== undefined ? Number(score) : null,
    });
  } catch (err) {
    res.status(200).json({ error: true, message: err.message });
  }
};
