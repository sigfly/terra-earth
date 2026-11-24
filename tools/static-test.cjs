const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src/viewer.html'),'utf8');
const generated=fs.readFileSync(path.join(root,'terra-offline.html'),'utf8');
const script=source.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const helper=script.match(/function solarPoint\(date\)\{[^\n]+\}/)[0];
const ctx={};vm.createContext(ctx);vm.runInContext('const rad=Math.PI/180, wrap=n=>((n+180)%360+360)%360-180;'+helper+';this.solarPoint=solarPoint',ctx);
for(const [date,expected] of [['2026-03-20T12:00Z',0],['2026-06-21T12:00Z',23.44],['2026-12-21T12:00Z',-23.44]]){
  const [lat,lon]=ctx.solarPoint(new Date(date));assert.ok(Math.abs(lat-expected)<.3);assert.ok(Math.abs(lon)<4);
}
for(const name of ['color','topography','bathymetry']){
  const b64=fs.readFileSync(path.join(root,'assets',name+'.jpg')).toString('base64');assert.ok(generated.includes('data:image/jpeg;base64,'+b64));
}
assert.ok(!/__COLOR__|__LAND__|__SEA__/.test(generated));
const hosted=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
assert.equal(hosted,fs.readFileSync(path.join(root,'index.html'),'utf8'));
for(const name of ['color','topography','bathymetry']){
  assert.ok(hosted.includes('assets/'+name+'.jpg'));
  assert.deepEqual(fs.readFileSync(path.join(root,'assets',name+'.jpg')),fs.readFileSync(path.join(root,'dist/assets',name+'.jpg')));
}
assert.ok(!/__COLOR__|__LAND__|__SEA__/.test(hosted));
console.log('PASS: JavaScript syntax, solar geometry, embedded assets, generated output.');
