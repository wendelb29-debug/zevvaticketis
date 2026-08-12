import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OfflineScan {
  id: string;
  code: string;
  eventId: string;
  operatorId: string;
  timestamp: string;
  tenantId: string;
}

const STORAGE_KEY = 'zevva_offline_scans';

export function useOfflineScanner() {
  const [offlineQueue, setOfflineQueue] = useState<OfflineScan[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Load existing queue
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setOfflineQueue(JSON.parse(saved));
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      syncOfflineScans();
    }
  }, [isOnline, offlineQueue.length]);

  const addToQueue = (scan: Omit<OfflineScan, 'id'>) => {
    const newScan = { ...scan, id: crypto.randomUUID() };
    const newQueue = [...offlineQueue, newScan];
    setOfflineQueue(newQueue);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
    toast.info("Conexão instável. Leitura enfileirada para sincronização posterior.");
  };

  const syncOfflineScans = async () => {
    console.log("Syncing offline scans...", offlineQueue.length);
    const queue = [...offlineQueue];
    const failedScans: OfflineScan[] = [];

    for (const scan of queue) {
      try {
        // 1. Get ticket
        const { data: ticket } = await supabase
          .from("tickets")
          .select("id, status")
          .eq("qr_code", scan.code)
          .eq("event_id", scan.eventId)
          .maybeSingle();

        if (ticket && ticket.status !== 'utilizado') {
          // 2. Update ticket
          await supabase
            .from("tickets")
            .update({ 
              status: 'utilizado',
              checked_in_at: scan.timestamp
            } as any)
            .eq("id", ticket.id);
          
          // 3. Log record
          await supabase.from("checkin_records").insert({
            event_id: scan.eventId,
            ticket_id: ticket.id,
            operator_id: scan.operatorId,
            status: 'sucesso',
            checkin_date: scan.timestamp.split('T')[0],
            checkin_time: scan.timestamp.split('T')[1].split('.')[0],
            tenant_id: scan.tenantId,
            notes: 'Sincronizado via modo offline'
          });
        } else {
            // Log as failure if ticket invalid or already used
            await supabase.from("checkin_records").insert({
                event_id: scan.eventId,
                ticket_id: ticket?.id || null,
                operator_id: scan.operatorId,
                status: 'falha',
                checkin_date: scan.timestamp.split('T')[0],
                checkin_time: scan.timestamp.split('T')[1].split('.')[0],
                tenant_id: scan.tenantId,
                notes: ticket ? 'JÁ UTILIZADO (Offline Sync)' : 'INVÁLIDO (Offline Sync)'
            });
        }
      } catch (err) {
        console.error("Failed to sync scan", scan.id, err);
        failedScans.push(scan);
      }
    }

    setOfflineQueue(failedScans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(failedScans));
    
    if (failedScans.length === 0) {
      toast.success("Todas as leituras offline foram sincronizadas com sucesso!");
    } else {
      toast.error(`Falha ao sincronizar ${failedScans.length} leituras. Tentaremos novamente em breve.`);
    }
  };

  return {
    isOnline,
    offlineQueue,
    addToQueue
  };
}
