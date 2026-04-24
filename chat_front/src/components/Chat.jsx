import { useState, useEffect, useRef } from 'react'
import { createConsumer } from '@rails/actioncable'

const ROOM_ID = 1
const API_URL = 'http://localhost:3000'
const WS_URL = 'ws://localhost:3000/cable'
const EMAIL_OPTIONS = [
  { label: 'Sender', value: 'sender@example.com', peer: 'receiver@example.com' },
  { label: 'Receiver', value: 'receiver@example.com', peer: 'sender@example.com' },
]

function normalizeMessage(message) {
  return {
    id: message.id,
    sender_email: message.sender?.email ?? message.sender_email,
    receiver_email: message.receiver?.email ?? message.receiver_email,
    content: message.content,
    created_at: message.created_at,
  }
}

function mergeMessages(currentMessages, incomingMessages) {
  const messagesById = new Map(currentMessages.map((message) => [message.id, message]))

  incomingMessages.forEach((message) => {
    const normalizedMessage = normalizeMessage(message)
    const fallbackKey =
      normalizedMessage.id ??
      `${normalizedMessage.sender_email}-${normalizedMessage.receiver_email}-${normalizedMessage.content}-${normalizedMessage.created_at}`

    messagesById.set(fallbackKey, normalizedMessage)
  })

  return Array.from(messagesById.values()).sort(
    (firstMessage, secondMessage) =>
      new Date(firstMessage.created_at).getTime() - new Date(secondMessage.created_at).getTime()
  )
}

function formatTimestamp(timestamp) {
  if (!timestamp) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

function historyStatusText(messagesCount) {
  return `${messagesCount} mensagens carregadas`
}

export default function Chat() {
  const [selectedEmail, setSelectedEmail] = useState('sender@example.com')
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const subscriptionRef = useRef(null)
  const cableRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const currentOption = EMAIL_OPTIONS.find((opt) => opt.value === selectedEmail)
  const senderEmail = selectedEmail
  const receiverEmail = currentOption.peer

  const handleEmailChange = (e) => {
    setSelectedEmail(e.target.value)
  }

  useEffect(() => {
    let isMounted = true

    async function loadHistory() {
      setIsLoadingHistory(true)
      setHistoryError('')

      try {
        const response = await fetch(`${API_URL}/rooms/${ROOM_ID}/messages`)

        if (!response.ok) {
          throw new Error(`Failed to load history: ${response.status}`)
        }

        const data = await response.json()

        if (isMounted) {
          setMessages(mergeMessages([], data.messages ?? []))
        }
      } catch (error) {
        if (isMounted) {
          setHistoryError('Nao foi possivel carregar o historico.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false)
        }
      }
    }

    loadHistory()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (cableRef.current) {
      cableRef.current.disconnect()
    }

    const consumer = createConsumer(`${WS_URL}?email=${senderEmail}`)
    cableRef.current = consumer

    consumer.subscriptions.create(
      {
        channel: 'TransmissionChannel',
        room_id: ROOM_ID,
      },
      {
        connected() {
          console.log('✅ Connected to TransmissionChannel')
          setIsConnected(true)
        },
        received(data) {
          if (data.action === 'new_message') {
            setMessages((prev) => mergeMessages(prev, [data.message]))
          }
        },
        disconnected() {
          console.log('❌ Disconnected from TransmissionChannel')
          setIsConnected(false)
        },
      }
    )

    subscriptionRef.current = consumer.subscriptions.subscriptions[0]

    return () => {
      consumer.disconnect()
    }
  }, [senderEmail])

  useEffect(() => {
    const container = messagesContainerRef.current

    if (!container) return

    container.scrollTop = container.scrollHeight
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim() || !isConnected) return

    subscriptionRef.current.send({
      sender_email: senderEmail,
      receiver_email: receiverEmail,
      content: inputText,
    })

    setInputText('')
  }

  const historyStatus = historyError
    ? historyError
    : isLoadingHistory
      ? 'Carregando historico...'
      : historyStatusText(messages.length)

  return (
    <main className="mx-auto flex h-screen w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="grid h-full min-h-0 w-full gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[2rem] border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-blue-900 p-6 text-slate-100 shadow-2xl shadow-slate-300/40">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
            React + Cable
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Chat Room</h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
            Historico inicial via HTTP, atualizacao em tempo real por Action Cable e o mesmo
            layout do prototipo em Stimulus.
          </p>

          <div className="mt-8 space-y-5">
            <label className="block" htmlFor="email-select">
              <span className="mb-2 block text-sm font-medium text-slate-200">Entrar como</span>
              <select
                id="email-select"
                value={selectedEmail}
                onChange={handleEmailChange}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-300 focus:bg-white/20"
              >
                {EMAIL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="text-slate-900">
                    {opt.label} ({opt.value})
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Conexao
              </p>
              <strong className="mt-2 block text-sm font-medium text-white">
                {isConnected ? `Connected as ${senderEmail}` : 'Disconnected'}
              </strong>
              <span
                className={`mt-2 block text-sm leading-6 ${
                  historyError ? 'text-rose-300' : 'text-slate-300'
                }`}
              >
                {historyStatus}
              </span>
            </div>
          </div>
        </aside>

        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-chat-panel shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chat-muted">
                  Sala 1
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                  Conversa ativa
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                realtime
              </div>
            </div>
          </header>

          <section
            ref={messagesContainerRef}
            className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#eff6ff,transparent_30%),linear-gradient(to_bottom,#ffffff,#f8fafc)] px-4 py-5 sm:px-6"
          >
            {isLoadingHistory ? (
              <div className="flex h-full min-h-80 items-center justify-center">
                <p className="rounded-full border border-dashed border-slate-300 px-6 py-3 text-sm text-slate-400">
                  Carregando historico...
                </p>
              </div>
            ) : historyError ? (
              <div className="flex h-full min-h-80 items-center justify-center">
                <p className="rounded-full border border-rose-200 bg-rose-50 px-6 py-3 text-sm text-rose-500">
                  {historyError}
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full min-h-80 items-center justify-center">
                <p className="rounded-full border border-dashed border-slate-300 px-6 py-3 text-sm text-slate-400">
                  Nenhuma mensagem ainda.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_email === senderEmail
                const bubbleClasses = isOwn
                  ? 'bg-chat-accent text-white shadow-blue-200/70'
                  : 'border border-slate-200 bg-white text-slate-900 shadow-slate-200/70'
                const timeClasses = isOwn ? 'text-blue-100' : 'text-slate-400'

                return (
                  <article
                    key={msg.id ?? `${msg.sender_email}-${msg.created_at}-${msg.content}`}
                    className={`mb-3 flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[1.4rem] px-4 py-3 shadow-lg sm:max-w-[70%] ${bubbleClasses}`}
                    >
                      {!isOwn && (
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                          {msg.sender_email}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {msg.content}
                      </p>
                      <time className={`mt-2 block text-right text-[11px] ${timeClasses}`}>
                        {formatTimestamp(msg.created_at)}
                      </time>
                    </div>
                  </article>
                )
              })
            )}
          </section>

          <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-4 sm:p-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Mensagem</span>
              <textarea
                rows="3"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-chat-accent focus:bg-white"
                disabled={!isConnected}
              />
            </label>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs leading-5 text-slate-500">
                O historico e exibido no carregamento e novas mensagens entram sem refresh.
              </p>
              <button
                type="submit"
                disabled={!isConnected || !inputText.trim()}
                className="inline-flex items-center justify-center rounded-full bg-chat-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-chat-accent-dark disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Enviar
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  )
}
