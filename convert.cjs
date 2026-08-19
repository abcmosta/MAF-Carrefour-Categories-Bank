
const fs=require('fs'), x=require('xlsx');
const S=v=>v==null?'':String(v).trim();
const src='MKP Categories .xlsx';
if(!fs.existsSync(src)){console.log('SOURCE_NOT_FOUND: '+src);process.exit(1);}
const wb=x.readFile(src);
const rows=x.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
const recs=[];
for(const d of rows){
  const path=S(d.miraklpath);
  const categoryLevels=path.split('_').filter(Boolean).slice(1,-1);
  recs.push({path,productType:S(d.producttype),template:S(d.template),vertical:categoryLevels[1]||'',l1:categoryLevels[0]||'',l2:categoryLevels[1]||'',l3:categoryLevels[2]||'',l4:categoryLevels[3]||''});
}
const unmatched=0;
let old=[]; try{ old=JSON.parse(fs.readFileSync('src/fullLegacyRaw.json')); }catch(e){}
const newPT=new Set(recs.map(r=>r.productType.toLowerCase()));
let bestCol=-1,bestOverlap=-1;
for(let c=0;c<8;c++){ const seen=new Set(); let o=0; for(const r of old){ const v=S(r[c]).toLowerCase(); if(v&&!seen.has(v)){seen.add(v); if(newPT.has(v))o++;} } if(o>bestOverlap){bestOverlap=o;bestCol=c;} }
const oldPT=new Set(old.map(r=>S(r[bestCol]).toLowerCase()).filter(Boolean));
const added=[...newPT].filter(p=>!oldPT.has(p));
const removed=[...oldPT].filter(p=>!newPT.has(p));
const common=[...newPT].filter(p=>oldPT.has(p));
const depts={}; for(const r of recs){ if(r.l1) depts[r.l1]=(depts[r.l1]||0)+1; }
const topDepts=Object.entries(depts).sort((a,b)=>b[1]-a[1]);
fs.writeFileSync('src/mkpCategories.json', JSON.stringify(recs));
const rep=['# Taxonomy Change Report','',
'Source file: `'+src+'` (raw category export)','',
'## Summary',
'- New source-of-truth records: **'+recs.length+'** ('+(recs.length-unmatched)+' fully mapped, '+unmatched+' unmatched)',
'- Distinct L1 departments: **'+topDepts.length+'**',
'- Previous dataset (fullLegacyRaw): **'+old.length+'** rows',
'',
'## Diff vs current data (matched on product-type name)',
'- Carried over (common): **'+common.length+'**',
'- Added (in new, not old): **'+added.length+'**',
'- Removed (in old, not new): **'+removed.length+'**',
'',
'## L1 departments ('+topDepts.length+')',
topDepts.map(d=>'- '+d[0]+' — '+d[1]).join('\n'),
'',
'## Unmatched product types (no taxonomy path): '+unmatched,
recs.filter(r=>r.unmatched).map(r=>'- '+r.productType+' (`'+r.path+'`)').join('\n'),
'',
'## Sample added product types ('+Math.min(40,added.length)+' of '+added.length+')',
added.slice(0,40).map(p=>'- '+p).join('\n'),
'',
'## Sample removed product types ('+Math.min(40,removed.length)+' of '+removed.length+')',
removed.slice(0,40).map(p=>'- '+p).join('\n'),
].join('\n');
fs.writeFileSync('CHANGE_REPORT.md', rep);
console.log('DONE records='+recs.length+' unmatched='+unmatched+' L1depts='+topDepts.length+' oldRows='+old.length+' oldCol='+bestCol+' common='+common.length+' added='+added.length+' removed='+removed.length);
