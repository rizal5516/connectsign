interface Props {
  message?: string
}

export default function LoadingOverlay({ message = 'Memproses File PDF' }: Props) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="w-full max-w-md px-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-[#2FAAE1]/30 p-8 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-gray-200 rounded-full" />
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-[#0C4F81] rounded-full animate-spin" />
              <div
                className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-[#2FAAE1] rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}
              />
              <div
                className="absolute top-4 left-4 w-12 h-12 border-4 border-transparent border-t-[#FFA62B] rounded-full animate-spin"
                style={{ animationDuration: '1.8s' }}
              />
            </div>
          </div>

          <h3 className="mt-6 text-lg font-bold text-[#0C4F81]">{message}</h3>
          <p className="mt-1 text-sm text-gray-600">Harap tunggu sebentar...</p>

          <div className="mt-5 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-[#0C4F81] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[#2FAAE1] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-[#FFA62B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  )
}