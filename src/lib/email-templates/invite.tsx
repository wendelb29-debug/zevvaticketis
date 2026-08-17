import * as React from 'react'
import { Heading, Text, Button, Link } from '@react-email/components'
import { EmailLayout, styles } from './Layout'

interface InviteEmailProps {
  confirmationUrl: string
  organizationName?: string
  invitedBy?: string
  role?: string
}

export const InviteEmail = ({ confirmationUrl, organizationName, invitedBy, role }: InviteEmailProps) => (
  <EmailLayout previewText="Uma organização convidou você para fazer parte da Zevva.">
    <Heading style={styles.h1}>Você foi convidado</Heading>
    <Text style={styles.text}>
      Você recebeu um convite para acessar a Zevva e colaborar
      {organizationName ? ` com a organização ${organizationName}` : ' em um evento'}
      {invitedBy ? ` através de ${invitedBy}` : ''}
      {role ? ` como ${role}` : ''}.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Aceitar convite
    </Button>
    <Text style={styles.linkAlternative}>
      Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
      <br />
      <Link href={confirmationUrl} style={{ color: '#D94B52' }}>{confirmationUrl}</Link>
    </Text>
    <Text style={styles.securityNotice}>
      Se você não reconhece este convite, ignore este e-mail.
    </Text>
  </EmailLayout>
)

export default InviteEmail
