
const fs=require('fs'), x=require('xlsx');
const S=v=>v==null?'':String(v).trim();
const files=fs.readdirSync('.').filter(f=>/\.xlsx$/i.test(f));
let src=null;
for(const f of files){ try{ if(x.readFile(f).SheetNames.some(s=>/^final/i.test(s.trim()))){src=f;break;} }catch(e){} }
if(!src){console.log('NO_SOURCE_WITH_FINAL_SHEET; files='+JSON.stringify(files));process.exit(1);}
const wb=x.readFile(src);
const F=re=>wb.SheetNames.find(s=>re.test(s.trim()));
const tax=x.utils.sheet_to_json(wb.Sheets[F(/^taxonomy/i)],{defval:''});
const fin=x.utils.sheet_to_json(wb.Sheets[F(/^final/i)],{defval:''});
const mkp=x.utils.sheet_to_json(wb.Sheets[F(/^mkp/i)],{defval:''});
const code2={};
for(const d of tax){ for(const n of [1,2,3,4]){ const c=S(d['Level '+n+' code']); if(c&&!(c in code2)) code2[c]=[S(d['Level '+n+' Name']),S(d['Level '+n+' Name_AR'])]; } }
const nm=(c,i)=>{const v=code2[S(c)];return v?v[i]:'';};
const recs=[];
for(const d of fin){
  const cs=[S(d.level_1_code),S(d.level_2_code),S(d.level_3_code),S(d.level_4_code)];
  const l=cs.map(c=>nm(c,0)), a=cs.map(c=>nm(c,1));
  recs.push({path:S(d.miraklpath),productType:S(d.producttype),vertical:l[2]||l[1],l1:l[0],l2:l[1],l3:l[2],l4:l[3],l1_ar:a[0],l2_ar:a[1],l3_ar:a[2],l4_ar:a[3],hybris:S(d['Classification code in Hybris'])});
}
const ptset=new Set(recs.map(r=>r.productType));
let unmatched=0;
for(const d of mkp){ const pt=S(d.producttype); if(pt&&!ptset.has(pt)){ recs.push({path:S(d.miraklpath),productType:pt,vertical:'',l1:'',l2:'',l3:'',l4:'',l1_ar:'',l2_ar:'',l3_ar:'',l4_ar:'',hybris:'',unmatched:true}); unmatched++; ptset.add(pt);} }
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
'Source file: `'+src+'` (Final + Taxonomy sheets)','',
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
