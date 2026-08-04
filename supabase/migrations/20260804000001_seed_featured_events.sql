-- Seed featured events
INSERT INTO public.events (
  titulo, 
  descricao, 
  data_inicio, 
  cidade, 
  min_price, 
  status, 
  destaque, 
  banner_url, 
  category
) VALUES 
('Conferência Águas Vivas 2026', 'Uma conferência transformadora em Orlando.', '2026-09-12', 'Orlando, FL', 89, 'publicado', true, 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200', 'Conferências'),
('Caravana Terra Santa: Passos de Jesus', 'Uma jornada espiritual inesquecível por Israel e Jordânia.', '2026-12-01', 'Israel & Jordânia', 2450, 'publicado', true, 'https://images.unsplash.com/photo-1547127796-06bb04e4b315?auto=format&fit=crop&q=80&w=1200', 'Caravanas'),
('Retiro Monte Sinai', 'Momento de reflexão e paz interior no Monte Sinai.', '2026-11-20', 'Uberlândia, BR', 180, 'publicado', true, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200', 'Retiros'),
('Encontro de Líderes Vinha', 'Capacitação e networking para líderes em Lisboa.', '2026-10-03', 'Lisboa, PT', 65, 'publicado', true, 'https://images.unsplash.com/photo-1505232458627-54b726b6118f?auto=format&fit=crop&q=80&w=1200', 'Cursos'),
('Grand Tour 2026: Europa Medieval', 'Explore as cidades medievais mais fascinantes da Europa.', '2026-06-01', 'Vários países', 3200, 'publicado', true, 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=1200', 'Viagens');
