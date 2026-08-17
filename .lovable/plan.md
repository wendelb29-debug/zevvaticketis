# Plano de Implementação: Sistema Oficial de Ingressos Zevva

Implementação do motor de emissão, validação segura e interfaces para participantes e produtores.

## 1. Banco de Dados e Segurança (Fase Backend)
- **Migration**: Criar tabela `checkin_logs` e garantir que `tickets` tenha todas as colunas necessárias (`token_hash`, `checked_in_at`, `attendee_name`, etc.).
- **RPC `process_ticket_checkin`**: Implementar validação atômica no servidor para evitar race conditions e garantir que um ingresso só seja usado uma vez.
- **Políticas RLS**: Hardening das políticas de `tickets` e `checkin_logs` para isolamento multi-tenant.

## 2. Área do Participante (Minha Conta)
- **Nova Rota `/app/meus-ingressos`**: Lista de ingressos ativos com design premium.
- **Componente `DigitalTicket`**: Exibição do ingresso com Flyer, dados do participante e QR Code seguro.
- **Geração de PDF**: Implementar botão para download do ingresso em formato PDF.

## 3. Painel do Produtor (Gestão)
- **Ingressos Emitidos**: Adicionar aba dentro de cada evento para gerenciar ingressos (filtro, busca, reenvio, cancelamento e reemissão).
- **Design do Ingresso**: Nova seção em Configurações do Evento para customizar flyer, logo e cores.
- **Scanner Staff**: Ajustar o scanner existente para exigir seleção de evento e usar a nova RPC de validação segura.

## 4. Testes e Validação
- Validar fluxo completo: Compra -> Emissão -> Check-in.
- Testar cenários de erro: QR falso, ingresso já usado, evento incorreto.
- Verificar isolamento entre diferentes organizações (tenants).

## Detalhes Técnicos
- **QR Code**: Formato `zevva:ticket:v1:<token>`. Token não é salvo; apenas o hash SHA-256.
- **I18n**: Tradução completa de todas as interfaces para Português (Brasil).
- **Performance**: Cache de design do ingresso no evento para evitar redundância.
