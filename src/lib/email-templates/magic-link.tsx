import * as React from 'react'
import { Heading, Text, Button, Link } from '@react-email/components'
import { EmailLayout, styles } from './Layout'

interface MagicLinkEmailProps {
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <EmailLayout previewText="Entre na sua conta sem precisar digitar a senha.">
    <Heading style={styles.h1}>Acesse sua conta</Heading>
    <Text style={styles.text}>
      Use o botão abaixo para entrar com segurança na Zevva.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Acessar a Zevva
    </Button>
    <Text style={styles.linkAlternative}>
      Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
      <br />
      <Link href={confirmationUrl} style={{ color: '#D94B52' }}>{confirmationUrl}</Link>
    </Text>
    <Text style={styles.securityNotice}>
      Este link é pessoal e não deve ser compartilhado. Se você não solicitou este acesso, ignore o e-mail.
    </Text>
  </EmailLayout>
)

export default MagicLinkEmail
