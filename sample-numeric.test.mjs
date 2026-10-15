import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {fPower,pairedPower,integerSearch} from '../sample-size/numeric.mjs';
const fixture=JSON.parse(fs.readFileSync(new URL('./numeric-reference.json',import.meta.url)));
for(const p of fixture.f)test(`F não central contra SciPy: ${JSON.stringify(p)}`,()=>assert.ok(Math.abs(fPower(p.df1,p.df2,p.lambda_,p.alpha)-p.power)<2e-6));
for(const p of fixture.paired)test(`t pareado contra SciPy: ${JSON.stringify(p)}`,()=>assert.ok(Math.abs(pairedPower(p.n,p.d,p.alpha,p.side)-p.power)<2e-6));
test('Busca sem solução termina com mensagem; não retorna teto como resultado',()=>assert.throws(()=>integerSearch(()=>.1,.8,2,1024),/Nenhuma solução/));
