# Planejamento: Sistema Oficial de Emissão e Validação de Ingressos Zevva

Este documento descreve a arquitetura e o plano de implementação para o sistema de ticketing, garantindo segurança, integridade dos dados e isolamento multi-tenant.

## 1. Auditoria e Mapeamento do Schema Atual

Atualmente, temos tabelas que cobrem parte dos requisitos, mas precisam de ajustes para conformidade com o modelo canônico.

### Tabelas Existentes vs. Necessárias

| Tabela | Status Atual | Ajustes Necessários |
| :--- | :--- | :--- |
| `events` | Existe | Mapear `produtor_id` para o dono do tenant. |
| `ticket_types` | Existe | Validar campos de preço e quantidade. |
| `orders` | Existe | Status: `pending`, `paid`, `cancelled`, `refunded`. |
| `tickets` | Existe | **Crítico:** Remover `qr_code` (plaintext). Adicionar `token_hash`, `attendee_id`. |
| `attendees` | A ser validada | Garantir vínculo individual participante <=> ingresso. |
| `checkins` | Existe | Registrar `ticket_id`, `operator_id` e `timestamp`. |
| `checkin_logs` | Existe | Usar para auditoria de todas as tentativas (sucesso/falha). |

## 2. Fluxo de Emissão e QR Code Seguro

### Segurança do QR Code
O QR Code não conterá dados sensíveis. Ele será composto por um **Signed Token** (JWT ou Hash assinado) contendo apenas o `ticket_id` e um `nonce` aleatório. No banco, armazenaremos apenas o `hash` desse token para verificação.

### Fluxo de Confirmação (Webhook)
1. Recebimento do Webhook de pagamento.
2. Atualização da `order` para `paid`.
3. Geração atômica de `N` ingressos (um para cada item do pedido).
4. Disparo de e-mail/notificação com link para o ingresso.

## 3. Plano de Implementação

### Fase 1: Hardening do Banco de Dados (Migration)
- Atualizar `public.tickets` para incluir `token_hash` e remover dados sensíveis.
- Criar funções RPC `validate_ticket` e `process_checkin` com `SECURITY DEFINER` e `search_path` protegido.
- Hardening das políticas RLS para garantir que operadores vejam apenas ingressos de sua organização.

### Fase 2: Backend e Emissão
- Implementar lógica de geração de tokens criptográficos.
- Criar endpoint de emissão pós-pagamento.
- Implementar lógica de cancelamento/reemissão (invalidação de tokens antigos).

### Fase 3: Interface Administrativa
- **Ingressos Emitidos:** Lista avançada com filtros, visualização e ações manuais.
- **Configurações:** Editor de design do ingresso (flyer, logo, cores).

### Fase 4: Experiência do Participante
- **Meus Ingressos:** Área logada para visualização, download PDF e QR Code dinâmico.

### Fase 5: Validação (Scanner)
- Refatorar scanner para enviar tokens para o backend.
- Lógica de "Ingresso já utilizado" com detalhes do primeiro check-in.
- Registro de auditoria em `checkin_logs`.

## 4. Matriz de Testes
- [ ] QR Codes diferentes para ingressos do mesmo pedido.
- [ ] Rejeição de QR falso ou de outro evento.
- [ ] Prevenção de dupla entrada (race condition check).
- [ ] Invalidação automática após reembolso/reemissão.
- [ ] Validação de permissões de operador.

---
**Nota:** Não utilizaremos `service_role` no frontend. Toda validação será delegada ao servidor via RPCs seguras.
