-- 1. Remove o índice atual que era permissivo com NULLs
DROP INDEX IF EXISTS public.idx_events_title_producer_unique;

-- 2. Cria um índice único que impede títulos duplicados mesmo quando producer_id é nulo
CREATE UNIQUE INDEX idx_events_title_unique_null_safe ON public.events (title) WHERE producer_id IS NULL;

-- 3. Mantém a unicidade para casos com producer_id preenchido
CREATE UNIQUE INDEX idx_events_title_producer_unique_v2 ON public.events (title, producer_id) WHERE producer_id IS NOT NULL;