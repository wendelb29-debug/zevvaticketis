-- Seed featured events with corrected column names and valid producer_id
INSERT INTO public.events (
  title, 
  description, 
  start_date, 
  city, 
  min_price, 
  status, 
  destaque, 
  cover_image, 
  category,
  producer_id
) VALUES 
('Conferência Águas Vivas 2026', 'Uma conferência transformadora em Orlando.', '2026-09-12', 'Orlando, FL', 89, 'publicado', true, 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200', 'Conferências', '101eccb0-32f3-4fa0-938f-827d36ee4380'),
('Caravana Terra Santa: Passos de Jesus', 'Uma jornada espiritual inesquecível por Israel e Jordânia.', '2026-12-01', 'Israel & Jordânia', 2450, 'publicado', true, 'https://images.unsplash.com/photo-1547127796-06bb04e4b315?auto=format&fit=crop&q=80&w=1200', 'Caravanas', '101eccb0-32f3-4fa0-938f-827d36ee4380'),
('Retiro Monte Sinai', 'Momento de reflexão e paz interior no Monte Sinai.', '2026-11-20', 'Uberlândia, BR', 180, 'publicado', true, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200', 'Retiros', '101eccb0-32f3-4fa0-938f-827d36ee4380'),
('Encontro de Líderes Vinha', 'Capacitação e networking para líderes em Lisboa.', '2026-10-03', 'Lisboa, PT', 65, 'publicado', true, 'https://images.unsplash.com/photo-1505232458627-54b726b6118f?auto=format&fit=crop&q=80&w=1200', 'Cursos', '101eccb0-32f3-4fa0-938f-827d36ee4380'),
('Grand Tour 2026: Europa Medieval', 'Explore as cidades medievais mais fascinantes da Europa.', '2026-06-01', 'Vários países', 3200, 'publicado', true, 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=1200', 'Viagens', '101eccb0-32f3-4fa0-938f-827d36ee4380');