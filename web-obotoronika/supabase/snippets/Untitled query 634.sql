select pg_get_functiondef(p.oid) as func_def
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'get_bandwidth_last_n_days'
  and n.nspname = 'public';