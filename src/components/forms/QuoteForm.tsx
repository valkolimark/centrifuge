import { CognitoForm } from './CognitoForm'

// Client-standardized lead forms are Cognito. These thin wrappers embed the two
// provided Cognito forms (EZ Quote #14, Contact #4) so every inline form on the
// site uses Cognito instead of the native forms engine.
const COGNITO_KEY = '6-kP0CxQH0CwXlv_9oww1A'

export function QuoteForm() {
  return <CognitoForm dataKey={COGNITO_KEY} formId="14" />
}

export function ContactForm() {
  return <CognitoForm dataKey={COGNITO_KEY} formId="4" />
}
