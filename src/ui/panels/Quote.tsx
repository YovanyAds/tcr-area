import { quote } from '../../content/site'
import { ContactBlock } from './Content'

// Formulario y configurador: fase 5.
export default function QuoteContent({ id }: { id?: string }) {
  return (
    <div>
      <h2 id={id}>{quote.title}</h2>
      <p>{quote.text}</p>
      <ContactBlock />
    </div>
  )
}
