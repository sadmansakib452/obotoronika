const fs = require('fs')
const path = require('path')

function walk(dir, list) {
  const files = fs.readdirSync(dir)
  for (const f of files) {
    const full = path.join(dir, f)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walk(full, list)
    else if (f.endsWith('.ts') && !full.includes('serverSupabase.ts')) list.push(full)
  }
}

const files = []
walk('server', files)
let count = 0
for (const file of files) {
  let c = fs.readFileSync(file, 'utf8')
  if (!c.includes('serverSupabaseClient')) continue
  c = c.replace(
    /import \{ serverSupabaseClient \} from '#supabase\/server'/g,
    'import { getServerSupabase } from \'~~/server/utils/serverSupabase\'',
  )
  c = c.replace(/serverSupabaseClient\(event\)/g, 'getServerSupabase(event)')
  fs.writeFileSync(file, c)
  count++
}
console.log('Updated', count, 'files')
