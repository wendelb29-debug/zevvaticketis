import * as React from 'react'
import { Heading, Text, Button, Link } from '@react-email/components'
import { EmailLayout, styles } from './Layout'

interface RecoveryEmailProps {
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <EmailLayout previewText="Use este link seguro para criar uma nova senha.">
    <Heading style={styles.h1}>Redefinição de senha</Heading>
    <Text style={styles.text}>
      Recebemos uma solicitação para redefinir a senha associada à sua conta Zevva.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Criar nova senha
    </Button>
    <Text style={styles.linkAlternative}>
      Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
      <br />
      <Link href={confirmationUrl} style={{ color: '#D94B52' }}>{confirmationUrl}</Link>
    </Text>
    <Text style={styles.securityNotice}>
      Se você não solicitou a redefinição, ignore este e-mail. Sua senha atual permanecerá válida.
    </Text>
  </EmailLayout>
)

export default RecoveryEmail
