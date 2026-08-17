import * as React from 'react'
import { Heading, Text, Section } from '@react-email/components'
import { EmailLayout, styles } from './Layout'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <EmailLayout previewText="Use este código para confirmar uma ação protegida.">
    <Heading style={styles.h1}>Confirme sua identidade</Heading>
    <Text style={styles.text}>
      Para continuar com esta ação protegida, informe o código de segurança abaixo na Zevva.
    </Text>
    
    <Section style={styles.codeBlock}>
      <Text style={styles.code}>{token}</Text>
    </Section>

    <Text style={styles.subtext}>
      Não compartilhe este código com ninguém, inclusive com pessoas que afirmem trabalhar para a Zevva.
    </Text>

    <Text style={styles.securityNotice}>
      Se você não iniciou esta ação, encerre suas sessões ou altere sua senha.
    </Text>
  </EmailLayout>
)

export default ReauthenticationEmail
