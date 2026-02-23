import type { NotifType } from '../../types/signing.type'

interface Props {
  open: boolean
  type: NotifType
  title: string
  message: string
  onClose: () => void
}

const ACCENT_MAP: Record<NotifType, string> = {
  success: 'from-green-400 to-emerald-500',
  error: 'from-red-400 to-rose-500',
  info: 'from-[#2FAAE1] to-[#0C4F81]',
}

function NotifIcon({ type }: { type: NotifType }) {
  if (type === 'success') {
    return (
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-green-300 blur-xl opacity-40" />
        <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    )
  }

  if (type === 'error') {
    return (
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v4m0 4h.01" />
        </svg>
      </div>
    )
  }

  return (
    <div className="w-20 h-20 rounded-full bg-[#E8F7FF] flex items-center justify-center">
      <svg className="w-10 h-10 text-[#0C4F81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8h.01M11 12h1v6" />
      </svg>
    </div>
  )
}

export default function NotifModal({ open, type, title, message, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onMouseDown={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden text-center animate-[scaleIn_0.25s_ease-out]">
        <div className={`h-1 w-full bg-gradient-to-r ${ACCENT_MAP[type]}`} />

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <NotifIcon type={type} />
          </div>

          <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h3>
          <p className="text-gray-600 mt-3 leading-relaxed text-base">{message}</p>

          <button
            onClick={onClose}
            className="mt-6 px-8 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0C4F81] font-semibold text-sm transition-all duration-200 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}