import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoRepository, seedCommunity, filterPosts, communityView } from '../public/lib/community.mjs';
import { activeResidence, normalizeResidence, normalizeCandidates, createResidenceLookup, needsStudentCheck } from '../public/lib/residence.mjs';
import { nearby, composer } from '../public/features/community-views.mjs';
import { createResidenceFlows } from '../public/features/residence-flows.mjs';

class MemoryStorage {
  rows = new Map(); queue = Promise.resolve();
  update(scope, initial, mutate) {
    const result = this.queue.catch(() => {}).then(() => {
      const data = structuredClone(this.rows.get(scope) || initial());
      const value = mutate(data); this.rows.set(scope, structuredClone(data));
      return { data, result: value };
    });
    this.queue = result; return result;
  }
}
const home = (name='Test Hall', center=[42.35,-71.09]) => ({ name, address:`100 ${name} Street, Test City`, kind:'dorm', center });
const draft = visibility => ({ title:'Extra eggs', type:'available', category:'ingredients', offer:'free', quantity:2, pickup:'Lobby at 6 (sample)', visibility, photos:[] });
async function ready({student=false, center=[42.35,-71.09], storage=new MemoryStorage(), identity='test'}={}) {
  const repo = new DemoRepository(identity, storage); await repo.load();
  await repo.run('student', {isStudent:student, school:student?'Test University':''});
  await repo.run('residence',home('Test Hall',center)); return repo;
}
const feature = (extra={}) => ({type:'Feature',geometry:{type:'Point',coordinates:[-71.09,42.35]},properties:{name:'Test Hall',housenumber:'100',street:'Test Street',city:'Test City',osm_type:'W',osm_id:123,osm_key:'building',osm_value:'dormitory',...extra}});

test('residence candidates distinguish buildings from streets/campuses and reject invalid locations',()=>{
  const [building,area]=normalizeCandidates({features:[feature(),feature({osm_id:124,osm_key:'amenity',osm_value:'university'}),feature(),{geometry:{coordinates:[NaN,0]},properties:{}}]});
  assert.equal(building.building,true);assert.equal(building.kind,'dorm');assert.equal(building.id,'osm:W:123');
  assert.equal(area.building,false);assert.equal(area.approximate,true);assert.deepEqual(building.center,[42.35,-71.09]);
  assert.throws(()=>normalizeCandidates({}),/unreadable/);
});
test('manual residence IDs are stable and invalid residence metadata is rejected',()=>{
  assert.equal(normalizeResidence(home()).id,normalizeResidence({...home(),address:home().address.toUpperCase()}).id);
  assert.throws(()=>normalizeResidence({...home(),name:' '}),/building name/);
  assert.throws(()=>normalizeResidence({...home(),center:[91,0]}),/invalid/);
  assert.equal(normalizeResidence(home('Offline',null)).center,null);
});
test('lookup searches explicitly, caches by query, supports reverse, and handles failures and cancellation',async()=>{
  const calls=[];const lookup=createResidenceLookup({fetcher:async(url,options)=>{calls.push([url,options]);return {ok:true,json:async()=>({features:[feature()]})};}});
  await lookup.search('Test Hall');await lookup.search('Test Hall');assert.equal(calls.length,1);
  assert.equal(calls[0][0].pathname,'/api/');assert.equal(calls[0][0].searchParams.get('q'),'Test Hall');assert.equal(calls[0][1].credentials,'omit');
  await lookup.reverse([42.35,-71.09]);assert.equal(calls[1][0].pathname,'/reverse');assert.equal(calls[1][0].searchParams.get('lat'),'42.35');
  const controller=new AbortController();controller.abort();await assert.rejects(lookup.search('Test Hall',controller.signal),/cancelled/);
  await assert.rejects(lookup.reverse([NaN,0]),/not readable/);await assert.rejects(lookup.search('ab'),/between/);
  await assert.rejects(createResidenceLookup({fetcher:async()=>({ok:false,status:429})}).search('Test Hall'),/busy/);
  await assert.rejects(createResidenceLookup({fetcher:async()=>{throw new DOMException('Timed out','TimeoutError');}}).search('Test Hall'),{name:'TimeoutError'});
  lookup.clear();await lookup.search('Test Hall');assert.equal(calls.length,3);
});
test('student checks gate exchanges but browsing and reading remain available',async()=>{
  const repo=await ready({student:true}),view=communityView(repo.data);
  const post=view.posts.find(p=>p.visibility==='building'),group=view.groups.find(g=>g.visibility==='building');
  assert.ok(view.posts.length>0);assert.equal(needsStudentCheck(repo.data),true);
  for(const [action,value] of [['publish',draft('building')],['request',post.id],['join',{id:group.id,dish:'Kimchi jjigae'}],['complete',post.id]]) await assert.rejects(repo.run(action,value),/sample student ID/);
  await repo.run('read','share-carrots');await assert.rejects(repo.run('send',{id:'share-carrots',text:'Hello'}),/sample student ID/);
  await repo.run('checkStudent');assert.equal(repo.data.student.verification,'demo_complete');
  const id=await repo.run('request',post.id);await repo.run('send',{id,text:'Hello'});await repo.run('publish',draft('building'));
  await repo.run('student',{isStudent:true,school:'Other University'});assert.equal(needsStudentCheck(repo.data),true);
  await repo.run('student',{isStudent:false});assert.equal(needsStudentCheck(repo.data),false);
  await repo.run('student',{isStudent:true,school:'Other University'});assert.equal(needsStudentCheck(repo.data),true);
});
test('unconfigured and skipped identities cannot bypass setup via repository actions',async()=>{
  const repo=new DemoRepository('test',new MemoryStorage());await repo.load();await repo.run('skipSetup');
  assert.equal(communityView(repo.data).posts.length,0);
  for(const [action,value] of [['publish',draft()],['request','avocados'],['read','share-carrots'],['saveDraft',draft()]]) await assert.rejects(repo.run(action,value),/residence/);
});
test('building and neighborhood feeds have distinct visibility; drafts default private',async()=>{
  const repo=await ready(),buildingId=await repo.run('publish',draft()),publicId=await repo.run('publish',draft('neighborhood'));
  assert.equal(repo.data.posts.find(p=>p.id===buildingId).visibility,'building');
  const view=communityView(repo.data),building=filterPosts(view.posts,{scope:'building',residenceId:repo.data.activeResidenceId}),neighborhood=filterPosts(view.posts,{scope:'neighborhood'});
  assert.ok(building.some(p=>p.id===buildingId));assert.ok(building.some(p=>p.id===publicId));
  assert.ok(!neighborhood.some(p=>p.id===buildingId));assert.ok(neighborhood.some(p=>p.id===publicId));
  const html=composer({state:{composer:{...draft(),description:'',unit:'item'}},d:view,photoURL:()=>''});assert.match(html,/value="building" checked/);
  const ownGroup=await repo.run('publish',{...draft(),type:'meal_prep',dish:'Soup'}),post=repo.data.posts.find(p=>p.id===ownGroup);
  assert.equal(repo.data.groups.find(g=>g.id===post.groupId).visibility,'building');
});
test('switching residences preserves blobs, histories, drafts, and account-wide preferences',async()=>{
  const storage=new MemoryStorage(),repo=await ready({storage}),first=activeResidence(repo.data);
  await repo.run('saveDraft',{...draft(),photos:[new Blob(['photo'],{type:'image/jpeg'})]});
  const postId=await repo.run('publish',draft()),chat=await repo.run('request',postId);
  await repo.run('send',{id:chat,text:'Old residence history'});await repo.run('bookmark','soup');await repo.run('preferences',['Vegetarian']);
  await repo.run('residence',home('Second Hall'));assert.ok(!communityView(repo.data).posts.some(p=>p.id===postId));
  await assert.rejects(repo.run('request',postId),/current residence/);await assert.rejects(repo.run('send',{id:chat,text:'Wrong building'}),/current residence/);
  await repo.run('residence',first);assert.ok(repo.data.conversations.find(c=>c.id===chat).messages.some(m=>m.text==='Old residence history'));
  await repo.run('saveDraft',{...draft(),photos:[new Blob(['photo'],{type:'image/jpeg'})]});
  await repo.run('residence',home('Second Hall'));await repo.run('residence',first);
  const again=new DemoRepository('test',storage);await again.load();assert.equal(await again.data.draft.photos[0].text(),'photo');assert.deepEqual(again.data.saved,['soup']);assert.deepEqual(again.data.preferences,['Vegetarian']);
});
test('legacy records migrate on first residence without losing original IDs, photos, or memberships',async()=>{
  const storage=new MemoryStorage(),legacy=seedCommunity();legacy.posts[0].photos=[new Blob(['legacy photo'])];legacy.groups[0].members.push({person:'you',dish:'Kimchi jjigae'});storage.rows.set('test',legacy);
  const repo=await ready({storage});assert.equal(await repo.data.posts.find(p=>p.id==='avocados').photos[0].text(),'legacy photo');
  assert.ok(repo.data.groups.find(g=>g.id==='korean-week').members.some(m=>m.person==='you'));assert.ok(repo.data.conversations.some(c=>c.id==='share-carrots'));
  assert.equal(repo.data.posts.find(p=>p.id==='avocados').visibility,'neighborhood');
});
test('adding a provider map location to a manual building preserves its activity and future lookup identity',async()=>{
  const repo=await ready({center:null}),manual=activeResidence(repo.data),post=await repo.run('publish',draft());
  await repo.run('residence',{...home(),id:'osm:W:123',updateResidenceId:manual.id});
  assert.equal(activeResidence(repo.data).id,manual.id);assert.equal(activeResidence(repo.data).lookupId,'osm:W:123');assert.ok(repo.data.posts.some(p=>p.id===post));
  await repo.run('residence',home('Second Hall'));await repo.run('residence',{...home(),id:'osm:W:123'});
  assert.equal(activeResidence(repo.data).id,manual.id);assert.ok(repo.data.posts.some(p=>p.id===post));
  assert.equal(repo.data.residences.length,2);
  await assert.rejects(repo.run('residence',{...home(),updateResidenceId:'wrong-residence'}),/active residence changed/);
  await repo.run('residence',home('Second Hall'));
  await assert.rejects(repo.run('residence',{...home(),id:'osm:W:123',updateResidenceId:repo.data.activeResidenceId}),/already saved/);
});
test('manual buildings work without device location while neighborhood and maps require a saved point',async()=>{
  const repo=await ready({center:null}),view=communityView(repo.data),state={nearby:{scope:'building',view:'map'}};
  const html=nearby({state,d:view,photoURL:()=>''});assert.match(html,/nearby-list/);assert.match(html,/Same building/);assert.doesNotMatch(html,/nearby-map-canvas/);
  assert.match(nearby({state:{nearby:{scope:'neighborhood'}},d:view}),/Add your building’s map location/);
  await assert.rejects(repo.run('publish',draft('neighborhood')),/map location/);
  assert.ok(!communityView(repo.data).posts.some(p=>p.id==='avocados'));
});
test('reset clears residence and verification for one identity while preserving other identities',async()=>{
  const storage=new MemoryStorage(),a=await ready({storage,identity:'a',student:true}),b=await ready({storage,identity:'b'});await a.run('checkStudent');await b.run('bookmark','soup');
  await a.reset();await b.load();assert.equal(a.data.activeResidenceId,null);assert.equal(a.data.student.isStudent,null);assert.deepEqual(a.data.residences,[]);assert.deepEqual(a.data.communityArchives,{});assert.deepEqual(b.data.saved,['soup']);assert.ok(activeResidence(b.data));
});
test('late location and lookup results cannot reopen setup after cancellation or identity changes',async t=>{
  const originalDocument=globalThis.document,originalFetch=globalThis.fetch;
  const originalNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  const elements=new Map(),titles=[];let locationCallback,finishFetch;
  globalThis.document={querySelector(selector){if(!elements.has(selector))elements.set(selector,{elements:{query:{value:''}}});return elements.get(selector);},querySelectorAll(){return [];}};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{geolocation:{getCurrentPosition(resolve){locationCallback=resolve;}}}});
  globalThis.fetch=async()=>new Promise(resolve=>{finishFetch=resolve;});
  t.after(()=>{globalThis.document=originalDocument;globalThis.fetch=originalFetch;if(originalNavigator)Object.defineProperty(globalThis,'navigator',originalNavigator);else delete globalThis.navigator;});
  const state={repo:await ready()},flows=createResidenceFlows({state,render(){},showModal(title){titles.push(title);},closeModal(){flows.onClose();},modalError(message){throw new Error(message);},toast(){},onResidenceChanged(){}});
  flows.openSetup();await elements.get('#student-form').onsubmit({preventDefault(){},target:undefined});
  elements.get('#residence-locate').onclick();
  flows.resetIdentity();state.repo=await ready({identity:'different'});
  const before=titles.length;locationCallback({coords:{latitude:42.35,longitude:-71.09}});await new Promise(resolve=>setImmediate(resolve));
  assert.equal(titles.length,before);assert.equal(finishFetch,undefined);
  flows.openSetup();await elements.get('#student-form').onsubmit({preventDefault(){},target:undefined});elements.get('#residence-locate').onclick();
  locationCallback({coords:{latitude:42.35,longitude:-71.09}});await new Promise(resolve=>setImmediate(resolve));
  assert.equal(typeof finishFetch,'function');elements.get('#residence-manual').onclick();const confirmed=titles.length;
  finishFetch({ok:true,json:async()=>({features:[feature()]})});await new Promise(resolve=>setImmediate(resolve));
  assert.equal(titles.at(-1),'Confirm your building');assert.equal(titles.length,confirmed);
});
