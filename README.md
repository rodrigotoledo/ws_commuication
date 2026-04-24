## Project Approaches (English)

This repository demonstrates three approaches for building a real-time chat system:

### 1. Rails API with Action Cable (JSON only)
- The Rails backend acts purely as an API, exposing endpoints and Action Cable WebSocket connections.
- No server-side rendering: all responses are JSON.
- Action Cable is used directly for real-time features (chat, notifications, etc.).
- Suitable for SPAs or any client that consumes JSON and manages its own UI.

### 2. React Frontend with Action Cable
- A React application connects to the Rails Action Cable backend using an Action Cable client package (e.g., actioncable npm package).
- Real-time updates are handled in React components.
- Uses Tailwind CSS via npm for styling.
- No server-side rendering; all UI is managed by React.

### 3. Static Frontend (index.html) with Stimulus & Tailwind CDN
- A static HTML file (index.html) uses Stimulus.js for interactivity and connects to Action Cable via a JavaScript client.
- Tailwind CSS is included via CDN.
- No backend rendering or frameworks; all logic is in the browser.
- Real-time features are enabled by Action Cable client in the browser.

---

## Abordagens dos Projetos (Português)

Este repositório demonstra três abordagens para construir um sistema de chat em tempo real:

### 1. Rails API com Action Cable (apenas JSON)
- O backend Rails funciona apenas como API, expondo endpoints e conexões WebSocket do Action Cable.
- Sem renderização no servidor: todas as respostas são em JSON.
- O Action Cable é usado diretamente para recursos em tempo real (chat, notificações, etc.).
- Indicado para SPAs ou qualquer cliente que consuma JSON e gerencie sua própria interface.

### 2. Frontend React com Action Cable
- Uma aplicação React conecta-se ao backend Rails Action Cable usando um pacote cliente (ex: actioncable npm package).
- Atualizações em tempo real são tratadas nos componentes React.
- Usa Tailwind CSS via npm para estilização.
- Sem renderização no servidor; toda a interface é gerenciada pelo React.

### 3. Frontend Estático (index.html) com Stimulus & Tailwind CDN
- Um arquivo HTML estático (index.html) usa Stimulus.js para interatividade e conecta-se ao Action Cable via cliente JavaScript.
- Tailwind CSS é incluído via CDN.
- Sem renderização ou frameworks no backend; toda a lógica está no navegador.
- Recursos em tempo real são habilitados pelo cliente Action Cable no browser.
