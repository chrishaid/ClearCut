HSAT Full Item Bank (Original, Iowa/TerraNova-style)

Contents
- passages.json  (120 passages; informational + literary)
- items.json     (1000 items; 500 reading linked to passages; 500 math)
- scripts/importBank.mjs  (Node script to import into Supabase)

Notes
- All items are original and include answer_key + rationale.
- Reading items are designed to have unambiguous correct answers based on the passage text.
- Math items have numerically verified answers.

Import
1) Copy this folder into your repo at: content/hsat_full_item_bank/
2) npm i @supabase/supabase-js
3) Set env vars:
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
4) node content/hsat_full_item_bank/scripts/importBank.mjs

Tables must exist per the schema in the PRD/dev guide.
