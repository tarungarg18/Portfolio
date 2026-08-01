const HANDLE = 'tarunga9frs';

// GFG's own site blocks scraping from cloud/datacenter IPs (Vercel included) with a
// bot-protection challenge page, so we go through a community-run API instead that
// already solved this reliability problem.
module.exports = async (req, res) => {
  try {
    const r = await fetch(`https://gfg-stats-api.vercel.app/${HANDLE}`);
    const data = await r.json();
    if (data.status !== 'success') throw new Error('GFG stats API returned an error');

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({
      solved: data.data?.totalSolved ?? null,
      activeDays: data.data?.totalActiveDays ?? null,
    });
  } catch (err) {
    res.status(200).json({ error: true, message: err.message });
  }
};
