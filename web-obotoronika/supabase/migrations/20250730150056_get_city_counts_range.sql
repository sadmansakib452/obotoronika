create or replace function get_city_counts_range(days_ago integer)
returns table(city text, count bigint) as $$
  select city, count(*)
  from visitor_logs
  where created_at >= now() - (days_ago || ' days')::interval
    and city is not null and city != ''
  group by city
$$ language sql;
