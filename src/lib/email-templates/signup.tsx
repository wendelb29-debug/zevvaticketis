import * as React from 'react'
import { Heading, Text, Button, Link } from '@react-email/components'
import { EmailLayout, styles } from './Layout'

interface SignupEmailProps {
  confirmationUrl: string
}

export const SignupEmail = ({ confirmationUrl }: SignupEmailProps) => (
  <EmailLayout previewText="Falta apenas confirmar seu endereço de e-mail.">
    <Heading style={styles.h1}>Confirme seu cadastro</Heading>
    <Text style={styles.text}>
      Olá! Recebemos uma solicitação de cadastro na Zevva. Confirme seu endereço de e-mail para ativar sua conta e continuar.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Confirmar meu e-mail
    </Button>
    <Text style={styles.linkAlternative}>
      Caso o botão não funcione, copie e cole o link abaixo no seu navegador:
      <br />
      <Link href={confirmationUrl} style={{ color: '#D94B52' }}>{confirmationUrl}</Link>
    </Text>
    <Text style={styles.securityNotice}>
      Se você não criou uma conta na Zevva, ignore este e-mail.
    </Text>
  </EmailLayout>
)

export default SignupEmail
