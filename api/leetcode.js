const USERNAME = 'zDDCa3Pclh';

const QUERY = `
  query userStats($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    userContestRanking(username: $username) {
      rating
    }
    userContestRankingHistory(username: $username) {
      attended
      rating
    }
  }
`;

module.exports = async (req, res) => {
  try {
    const r = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { username: USERNAME } }),
    });
    const json = await r.json();
    if (!json.data || !json.data.matchedUser) throw new Error('LeetCode returned no data');

    const solvedAll = json.data.matchedUser.submitStatsGlobal.acSubmissionNum.find(
      (d) => d.difficulty === 'All'
    );
    const history = (json.data.userContestRankingHistory || []).filter((h) => h.attended);
    const maxRating = history.length ? Math.max(...history.map((h) => h.rating)) : null;
    const rating = json.data.userContestRanking ? json.data.userContestRanking.rating : null;

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({
      solved: solvedAll ? solvedAll.count : null,
      rating: rating ? Math.round(rating) : null,
      maxRating: maxRating ? Math.round(maxRating) : null,
    });
  } catch (err) {
    res.status(200).json({ error: true, message: err.message });
  }
};
