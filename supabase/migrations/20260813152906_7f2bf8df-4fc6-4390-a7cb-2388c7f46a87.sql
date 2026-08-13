ALTER TABLE public.whatsapp_contacts 
ADD CONSTRAINT whatsapp_contacts_tenant_normalized_phone_key UNIQUE (tenant_id, normalized_phone);
