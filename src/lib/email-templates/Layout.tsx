import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface EmailLayoutProps {
  children: React.ReactNode
  previewText: string
}

const LOGO_URL = "https://zevvaticketis.lovable.app/__l5e/assets-v1/805035f5-9a45-4f5a-9347-40d03cbea352/zevva-avatar.png"
const BRAND_CORAL = "#D94B52"

export const EmailLayout = ({ children, previewText }: EmailLayoutProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src={LOGO_URL}
            width="120"
            alt="Zevva Logo"
            style={logo}
          />
        </Section>
        
        <Section style={card}>
          {children}
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} Zevva. Todos os direitos reservados.
          </Text>
          <Text style={footerText}>
            Este é um e-mail automático enviado pela plataforma Zevva.
            <br />
            Precisa de ajuda? <Link href="https://zevvatickets.com/suporte" style={footerLink}>Entre em contato com o suporte</Link>
          </Text>
          <Hr style={hr} />
          <Text style={footerSubtext}>
            <Link href="https://zevvatickets.com/privacidade" style={footerLink}>Política de Privacidade</Link>
            {" • "}
            <Link href="https://zevvatickets.com/termos" style={footerLink}>Termos de Uso</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#F5F5F7',
  fontFamily: 'Arial, Helvetica, sans-serif',
  padding: '40px 0',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
}

const header = {
  textAlign: 'center' as const,
  paddingBottom: '24px',
}

const logo = {
  margin: '0 auto',
}

const card = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  padding: '40px',
  border: '1px solid #E5E5E5',
}

const footer = {
  textAlign: 'center' as const,
  paddingTop: '24px',
}

const footerText = {
  fontSize: '12px',
  color: '#666666',
  lineHeight: '1.5',
  margin: '12px 0',
}

const footerSubtext = {
  fontSize: '11px',
  color: '#999999',
}

const footerLink = {
  color: '#666666',
  textDecoration: 'underline',
}

const hr = {
  borderColor: '#E5E5E5',
  margin: '20px 0',
}

export const styles = {
  h1: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#171717',
    margin: '0 0 24px',
    textAlign: 'center' as const,
  },
  text: {
    fontSize: '16px',
    color: '#171717',
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  subtext: {
    fontSize: '14px',
    color: '#666666',
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  button: {
    backgroundColor: BRAND_CORAL,
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    borderRadius: '12px',
    padding: '16px 32px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    margin: '0 auto 24px',
  },
  linkAlternative: {
    fontSize: '12px',
    color: '#666666',
    wordBreak: 'break-all' as const,
    textAlign: 'center' as const,
    margin: '0 0 24px',
  },
  securityNotice: {
    fontSize: '12px',
    color: '#999999',
    textAlign: 'center' as const,
    margin: '24px 0 0',
    fontStyle: 'italic',
  },
  codeBlock: {
    backgroundColor: '#F5F5F7',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center' as const,
    margin: '0 0 24px',
  },
  code: {
    fontSize: '32px',
    fontFamily: 'Courier New, Courier, monospace',
    fontWeight: 'bold' as const,
    color: BRAND_CORAL,
    letterSpacing: '4px',
  }
}
