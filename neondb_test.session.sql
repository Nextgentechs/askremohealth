SELECT relname, oid
FROM pg_class
WHERE relkind = 'r' -- only tables
ORDER BY oid DESC;