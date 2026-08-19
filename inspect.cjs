const fs=require('fs'),x=require('xlsx');
const all=fs.readdirSync('.').filter(f=>{try{return !fs.statSync(f).isDirectory()}catch(e){return false}});
console.log('ROOT:',JSON.stringify(all));
const cand=all.filter(f=>/\.(xlsx|xls|csv)$/i.test(f)||/categoiz|categor|mkp/i.test(f));
for(const f of cand){ try{ const wb=x.readFile(f); console.log('FILE=['+f+'] SHEETS='+JSON.stringify(wb.SheetNames));
  for(const s of wb.SheetNames){const j=x.utils.sheet_to_json(wb.Sheets[s],{defval:''});console.log('  SHEET '+JSON.stringify(s)+' rows='+j.length+' cols='+(j[0]?Object.keys(j[0]).slice(0,16).join('|'):''));} }catch(e){console.log('ERR',f,e.message);} }
