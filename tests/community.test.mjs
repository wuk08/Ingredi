import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoRepository, actions, filterPosts, seedCommunity } from '../public/lib/community.mjs';
import { catalog,discover } from '../public/lib/recipes.mjs';
import { parseRoute } from '../public/lib/navigation.mjs';

// Transactional storage double: exercise the repository contract without a browser.
class MemoryStorage {
  rows=new Map();
  queue=Promise.resolve();
  update(scope,initial,mutate){const next=this.queue.catch(()=>{}).then(()=>{const data=structuredClone(this.rows.get(scope)||initial());const result=mutate(data);this.rows.set(scope,structuredClone(data));return {data,result};});this.queue=next;return next;}
}
const draft=()=>({type:'available',category:'ingredients',offer:'free',title:'Three ripe avocados',description:'A sample test listing.',quantity:3,pickup:'Sample lobby, 5–8 PM',photos:[]});

test('community drafts, photos, and edits survive loading a new repository',async()=>{
  const storage=new MemoryStorage(),repo=new DemoRepository('demo',storage);await repo.load();
  const value={...draft(),photos:[new Blob(['sample photo'],{type:'image/jpeg'})]};
  await repo.run('saveDraft',value);const again=new DemoRepository('demo',storage);await again.load();
  assert.equal(again.data.draft.title,value.title);assert.equal(await again.data.draft.photos[0].text(),'sample photo');
  const id=await again.run('publish',again.data.draft);assert.equal(again.data.draft,null);assert.equal(again.data.posts[0].id,id);
  assert.equal(again.data.conversations.find(c=>c.postId===id).unread,1);
});
test('account and anonymous community records remain separate',async()=>{
  const storage=new MemoryStorage(),a=new DemoRepository('account-a',storage),b=new DemoRepository('account-b',storage),anonymous=new DemoRepository('anonymous-demo',storage);
  await Promise.all([a.load(),b.load(),anonymous.load()]);await a.run('publish',draft());await a.run('bookmark','bibimbap');
  await b.load();await anonymous.load();assert.equal(a.data.posts.length,b.data.posts.length+1);assert.deepEqual(b.data.saved,[]);assert.deepEqual(anonymous.data.saved,[]);
});
test('filters combine search, post type, category, offer, and sample distance',()=>{
  const data=seedCommunity();assert.deepEqual(filterPosts(data.posts,{search:'avocado',type:'available',category:'ingredients',offer:'free',distance:.5}).map(p=>p.id),['avocados']);
  assert.equal(filterPosts(data.posts,{search:'not a match'}).length,0);assert.equal(filterPosts(data.posts,{category:'equipment',distance:.5}).length,0);
  assert.equal(filterPosts(data.posts,{own:true,distance:99}).every(p=>p.owner==='you'),true);
});
test('requesting twice reuses the conversation and its opening messages',()=>{
  const data=seedCommunity(),a=actions.request(data,'avocados'),b=actions.request(data,'avocados');assert.equal(a,b);assert.equal(data.conversations.find(c=>c.id===a).messages.length,2);assert.equal(data.posts.find(p=>p.id==='avocados').status,'reserved');
});
test('share completion and simulated rewards are idempotent across repository instances',async()=>{
  const storage=new MemoryStorage(),a=new DemoRepository('a',storage),b=new DemoRepository('a',storage);await a.load();await b.load();
  await Promise.all([a.run('complete','carrots'),b.run('complete','carrots')]);await a.load();assert.equal(a.data.impact.points,1290);assert.equal(a.data.impact.shares,19);assert.equal(a.data.completions.length,1);
});
test('receiving an available item does not award points for giving',()=>{
  const data=seedCommunity();actions.request(data,'avocados');actions.complete(data,'avocados');assert.equal(data.impact.points,1240);assert.equal(data.impact.shares,18);assert.equal(data.posts.find(p=>p.id==='avocados').status,'completed');
});
test('helping with a wanted item awards the giver once',()=>{
  const data=seedCommunity();actions.request(data,'eggs');actions.complete(data,'eggs');actions.complete(data,'eggs');assert.equal(data.impact.points,1290);
});
test('meal-swap membership is capacity-limited, dish-specific, and retry-safe',()=>{
  const data=seedCommunity();assert.throws(()=>actions.join(data,{id:'korean-week',dish:'Bibimbap'}),/available dish/);
  const a=actions.join(data,{id:'korean-week',dish:'Kimchi jjigae'}),b=actions.join(data,{id:'korean-week',dish:'Kimchi jjigae'});assert.equal(a,b);assert.equal(data.groups[0].members.length,4);assert.equal(data.conversations.filter(c=>c.groupId==='korean-week').length,1);
  data.groups[1].capacity=2;assert.throws(()=>actions.join(data,{id:'veggie-batch',dish:'Seasonal salad'}),/full/);
});
test('publishing a meal prep post creates its group and host dish',()=>{
  const data=seedCommunity(),id=actions.publish(data,{...draft(),type:'meal_prep',category:'meals',dish:'Bibimbap'}),post=data.posts.find(p=>p.id===id),group=data.groups.find(g=>g.id===post.groupId);assert.equal(group.members[0].person,'you');assert.equal(group.members[0].dish,'Bibimbap');assert.equal(group.capacity,4);
});
test('messages persist, replies are labeled by sample sender, and read clears unread',async()=>{
  const storage=new MemoryStorage(),repo=new DemoRepository('a',storage);await repo.load();await repo.run('read','share-carrots');await repo.run('send',{id:'share-carrots',text:'Around six works!'});await repo.load();const chat=repo.data.conversations.find(c=>c.id==='share-carrots');assert.equal(chat.unread,0);assert.equal(chat.messages.at(-2).text,'Around six works!');assert.equal(chat.messages.at(-1).sender,'jack');
});
test('failed mutations roll back without poisoning subsequent writes',async()=>{
  const storage=new MemoryStorage(),repo=new DemoRepository('a',storage);await repo.load();const count=repo.data.posts.length;await assert.rejects(repo.run('publish',{...draft(),title:' '}),/title/);await repo.run('bookmark','bibimbap');await repo.load();assert.equal(repo.data.posts.length,count);assert.deepEqual(repo.data.saved,['bibimbap']);
});
test('reset affects only the chosen community identity',async()=>{
  const storage=new MemoryStorage(),a=new DemoRepository('a',storage),b=new DemoRepository('b',storage);await a.load();await b.load();await a.run('complete','carrots');await b.run('bookmark','bibimbap');await a.reset();await b.load();assert.equal(a.data.impact.points,1240);assert.deepEqual(b.data.saved,['bibimbap']);assert.equal(storage.rows.size,2);
});
test('recipe collection merges by name, preserves backend IDs, and applies filters',()=>{
  const recipes=catalog([{id:'backend-rice',name:'Kimchi fried rice',ingredients:['rice','kimchi'],instructions:['Cook.'],cook_minutes:20}]);assert.equal(recipes.filter(r=>r.name==='Kimchi fried rice').length,1);assert.equal(recipes.find(r=>r.name==='Kimchi fried rice').id,'backend-rice');
  assert.equal(discover(recipes,[],{tags:['Korean','Under 20 min']}).every(r=>r.tags.includes('Korean')&&r.cook_minutes<=20),true);assert.equal(discover(recipes,[],{search:'coconut milk'})[0].name,'Golden vegetable curry');assert.equal(discover(recipes,[],{search:'no such meal'}).length,0);
});
test('route parsing validates tabs and safely handles encoded or malformed IDs',()=>{
  assert.deepEqual(parseRoute('#/cook/recipe/a%20b'),{tab:'cook',view:'recipe',id:'a b',path:'#/cook/recipe/a%20b'});assert.equal(parseRoute('#/unknown').tab,'home');assert.equal(parseRoute('#/home/chat/%XX').id,'');assert.equal(parseRoute('#/welcome').view,'welcome');
});
