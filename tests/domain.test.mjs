import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateItems, validateExtraction, validateImage, SAMPLE_SCAN, DEMO_RECIPES, matchRecipes, normalizeIngredient, MAX_IMAGE_BYTES } from '../public/lib/domain.mjs';

test('accepts edited groceries, trims fields, preserves quantities and optional dates',()=>{
  assert.deepEqual(validateItems([{name:' Milk ',quantity:1.5,unit:' gal ',expires_on:'2026-11-09'}]),[{name:'Milk',quantity:1.5,unit:'gal',expires_on:'2026-11-09'}]);
  assert.equal(validateItems([{name:'Eggs',quantity:12,unit:'item'}])[0].expires_on,null);
});
test('rejects empty selections, malformed amounts and impossible calendar dates',()=>{
  for(const quantity of [0,-1,NaN,Infinity,'2',0.001,1.111,10001]) assert.throws(()=>validateItems([{name:'Eggs',quantity,unit:'item'}]));
  for(const expires_on of ['2026-02-30','yesterday','2026-13-01']) assert.throws(()=>validateItems([{name:'Eggs',quantity:1,unit:'item',expires_on}]));
  assert.throws(()=>validateItems([])); assert.throws(()=>validateItems(Array(51).fill({name:'Eggs',quantity:1,unit:'item'})));
  assert.throws(()=>validateItems([{name:' ',quantity:1,unit:'item'}]));
});
test('validates provider output and preserves uncertain lines without inventing dates',()=>{
  const extraction=validateExtraction(SAMPLE_SCAN);
  assert.equal(extraction.items.length,7);
  assert.equal(extraction.items.at(-1).confidence,'low');
  assert.ok(extraction.items.every(i=>i.expires_on===null));
  assert.throws(()=>validateExtraction({items:'not-an-array'}));
  assert.throws(()=>validateExtraction({...SAMPLE_SCAN,items:[{name:'Eggs',unit:'item',quantity:-1,confidence:'high',raw_line:'EGGS'}]}));
  assert.throws(()=>validateExtraction({...SAMPLE_SCAN,items:[{...SAMPLE_SCAN.items[0],confidence:'certain'}]}));
});
test('normalizes precise receipt weights and flags them for review without weakening confirmation',()=>{
  const result=validateExtraction({...SAMPLE_SCAN,items:[{name:'Tomatoes',quantity:1.635,unit:'lb',confidence:'high',raw_line:'TOMATOES 1.635 LB'}]});
  assert.equal(result.items[0].quantity,1.64);assert.equal(result.items[0].confidence,'medium');assert.match(result.warnings[0],/rounded/);assert.equal(result.items[0].raw_line,'TOMATOES 1.635 LB');
  assert.throws(()=>validateItems([{name:'Tomatoes',quantity:1.635,unit:'lb'}]));
});
test('rejects disguised files, unsupported formats and oversized images',()=>{
  assert.throws(()=>validateImage(new TextEncoder().encode('<script>hello</script>'),'image/png'));
  assert.throws(()=>validateImage(new Uint8Array([255,216,255]),'image/svg+xml'));
  assert.throws(()=>validateImage(new Uint8Array(MAX_IMAGE_BYTES+1),'image/jpeg'));
  validateImage(new Uint8Array([137,80,78,71,13,10,26,10]),'image/png');
});
test('recipe matching uses complete ingredient names and aliases',()=>{
  const pantry=SAMPLE_SCAN.items.slice(0,6);
  const matches=matchRecipes(DEMO_RECIPES,pantry);
  assert.equal(matches[0].missing.length,0);
  assert.equal(matches[1].missing.length,0);
  assert.deepEqual(matches.find(i=>i.id==='rice').missing,['rice','kimchi','green onion']);
  assert.equal(normalizeIngredient(' Baby Spinach '),'spinach');
  assert.equal(matchRecipes([{ingredients:['rice'],name:'Rice'}],[{name:'rice vinegar'}])[0].have,0);
});
test('deployment domain module stays identical to the tested client module',async()=>{
  assert.equal(await readFile(new URL('../public/lib/domain.mjs',import.meta.url),'utf8'),await readFile(new URL('../supabase/functions/scan-receipt/domain.mjs',import.meta.url),'utf8'));
});
