// Prerender del contenido semántico para buscadores y redes (se inyecta en dist/index.html al compilar).
import { renderToString } from 'react-dom/server'
import { SemanticContent } from './ui/SemanticContent'

export const render = () => renderToString(<SemanticContent />)
