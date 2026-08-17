import * as React from 'react'
import { Heading, Text, Button, Link, Section } from '@react-email/components'
import { EmailLayout, styles } from './Layout'

interface OrderTicketsEmailProps {
  customerName: string;
  eventName: string;
  orderId: string;
  ticketCount: number;
  viewTicketsUrl: string;
}

export const OrderTicketsEmail = ({
  customerName = 'Cliente',
  eventName = 'Evento Zevva',
  orderId = 'ORD-0000',
  ticketCount = 1,
  viewTicketsUrl = '#'
}: OrderTicketsEmailProps) => (
  <EmailLayout previewText={`Seus ingressos para ${eventName} chegaram!`}>
    <Heading style={styles.h1}>Seus Ingressos Chegaram!</Heading>
    
    <Text style={styles.text}>
      Olá, <strong>{customerName}</strong>!
    </Text>
    
    <Text style={styles.text}>
      Sua compra foi finalizada com sucesso e seus ingressos para o evento <strong>{eventName}</strong> já estão disponíveis.
    </Text>

    <Section style={orderInfoCard}>
      <Text style={orderInfoTitle}>Detalhes do Pedido</Text>
      <Text style={orderInfoText}>
        <strong>Pedido:</strong> #{orderId}<br />
        <strong>Evento:</strong> {eventName}<br />
        <strong>Quantidade:</strong> {ticketCount} {ticketCount === 1 ? 'ingresso' : 'ingressos'}
      </Text>
    </Section>

    <Text style={styles.text}>
      Você pode baixar seus ingressos em PDF ou visualizá-los diretamente no seu celular clicando no botão abaixo:
    </Text>

    <Button style={styles.button} href={viewTicketsUrl}>
      Acessar Meus Ingressos
    </Button>

    <Text style={styles.linkAlternative}>
      Ou acesse pelo link:
      <br />
      <Link href={viewTicketsUrl} style={{ color: '#D94B52' }}>{viewTicketsUrl}</Link>
    </Text>

    <Text style={styles.subtext}>
      <strong>Dica:</strong> No dia do evento, apresente o QR Code do seu ingresso (digital ou impresso) para realizar o check-in.
    </Text>

    <Text style={styles.securityNotice}>
      Este e-mail é importante. Guarde-o com segurança, pois ele contém seus dados de acesso ao evento.
    </Text>
  </EmailLayout>
)

const orderInfoCard = {
  backgroundColor: '#F9F9FB',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #EDEDF2',
}

const orderInfoTitle = {
  fontSize: '14px',
  fontWeight: 'bold' as const,
  color: '#666666',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 12px',
}

const orderInfoText = {
  fontSize: '15px',
  color: '#171717',
  lineHeight: '1.5',
  margin: '0',
}

export default OrderTicketsEmail
