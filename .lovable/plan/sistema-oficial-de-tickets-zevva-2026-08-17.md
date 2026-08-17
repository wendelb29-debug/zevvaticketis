# Sistema Oficial de Tickets Zevva

Implementação do motor de emissão, validação e gerenciamento de ingressos.

## User Summary
Este módulo estabelece o padrão oficial de ingressos da Zevva, garantindo que cada entrada seja única, rastreável e segura contra fraudes ou duplicidade de uso.

## Technical Details

### Backend & Segurança
- **Tabela `checkin_logs`**: Registra cada tentativa de entrada (sucesso, já utilizado, evento errado, token inválido).
- **Hardened RPC `process_ticket_checkin`**: 
  - Validação atômica usando `FOR UPDATE` para prevenir condições de corrida.
  - Verificação de status do ingresso (Ativo, Utilizado, Cancelado).
  - Isolamento multi-tenant rigoroso.

### Experiência do Participante
- **Nova Rota `/app/meus-ingressos`**: Área centralizada para o cliente visualizar seus QR Codes.
- **Visual Premium**: Cartões de ingressos com badges de status e acesso rápido.

### Painel do Produtor
- **Gestão de Participantes**: Link atualizado para redirecionar usuários à nova área de ingressos.
- **Validação**: Scanner configurado para utilizar a lógica oficial de check-in atômico.

## Roadmap de Entrega
- [x] Schema de banco de dados e RLS
- [x] Lógica de validação server-side (RPC)
- [x] Área do Participante (`/app/meus-ingressos`)
- [x] Atualização dos fluxos de reenvio de e-mail
- [ ] Geração de PDF (Phase 4)
