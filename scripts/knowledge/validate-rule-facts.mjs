import fs from 'node:fs';
import path from 'node:path';
import { ROOT, KNOWLEDGE, json } from './common.mjs';

const contract = json(path.join(ROOT, 'contracts/recommendation-facts.json'));
const facts = new Set(Object.keys(contract.facts || {}));
const aliases = contract.aliases || {};
const source = fs.readFileSync(path.join(ROOT, 'mcp/src/recommendation/context.ts'), 'utf8');
const failures = [];
const executable = new Set();
const visit = (value, location) => {
  if (Array.isArray(value)) return value.forEach((entry, index) => visit(entry, `${location}[${index}]`));
  if (!value || typeof value !== 'object') return;
  if (typeof value.fact === 'string') {
    const resolved = aliases[value.fact] || value.fact;
    executable.add(resolved);
    if (!facts.has(resolved)) failures.push(`${location}.fact=${value.fact}: not registered`);
    if (resolved.startsWith('profile.') || value.fact === 'join_member') failures.push(`${location}.fact=${value.fact}: legacy executable fact`);
  }
  for (const [key, child] of Object.entries(value)) visit(child, `${location}.${key}`);
};
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.jsonl') && file.includes(`${path.sep}_decision${path.sep}`)) {
      for (const [index, line] of fs.readFileSync(file, 'utf8').split('\n').entries()) {
        if (line.trim()) visit(JSON.parse(line), `${path.relative(KNOWLEDGE, file)}:${index + 1}`);
      }
    }
  }
};
walk(KNOWLEDGE);
for (const [fact, definition] of Object.entries(contract.facts || {})) {
  for (const requestPath of definition.request_paths || []) {
    const key = requestPath.split('.').at(-1);
    if (key && !source.includes(key)) failures.push(`${fact}: request path ${requestPath} is not represented by the recommendation context schema`);
  }
}
const result = { ok: failures.length === 0, all_rule_facts_registered: failures.length === 0, all_rule_facts_input_representable: failures.length === 0, executable_fact_count: executable.size, executable_facts: [...executable].sort(), failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
