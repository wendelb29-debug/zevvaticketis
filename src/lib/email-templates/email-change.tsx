import * as React from 'react'
import { Heading, Text, Button, Link } from '@react-email/components'
import { EmailLayout, styles } from './Layout'

interface EmailChangeEmailProps {
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <EmailLayout previewText="Confirme o novo endereço para concluir a alteração.">
    <Heading style={styles.h1}>Confirme seu novo e-mail</Heading>
    <Text style={styles.text}>
      Recebemos uma solicitação para alterar o endereço de e-mail da sua conta Zevva.
    </Text>
    <Text style={styles.subtext}>
      <strong>Novo endereço:</strong> {newEmail}
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Confirmar novo e-mail
    </Button>
    <Text style={styles.linkAlternative}>
      Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
      <br />
      <Link href={confirmationUrl} style={{ color: '#D94B52' }}>{confirmationUrl}</Link>
    </Text>
    <Text style={styles.securityNotice}>
      Se você não solicitou esta alteração, não clique no botão e entre em contato com o suporte.
    </Text>
  </EmailLayout>
)

export default EmailChangeEmail
