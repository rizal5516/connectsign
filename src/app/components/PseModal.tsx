import Image from 'next/image'
import { PSE_OPTIONS } from '../constants/signing.constant'
import type { PseProvider } from '../types/signing.type'

interface Props {
  selected: PseProvider | ''
  onSelect: (pse: PseProvider) => void
  onClose: () => void
}

export default function PseModal({ selected, onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-[90%] max-w-md relative animate-[fadeIn_0.3s_ease-out]">
        <button
          aria-label="Tutup modal PSrE"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#0C4F81] transition-colors duration-200"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-[#0C4F81] mb-6 text-center">
          Pilih Penyelenggara Sertifikat Elektronik
        </h3>

        <div className="grid grid-cols-2 gap-6">
          {PSE_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item.id)
                onClose()
              }}
              className={`cursor-pointer flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                selected === item.name
                  ? 'border-[#2FAAE1] bg-[#E8F7FF]/70 shadow-lg'
                  : 'border-gray-200 hover:border-[#2FAAE1]/60'
              }`}
            >
              <Image
                src={item.logo}
                alt={item.name}
                width={80}
                height={80}
                className="rounded-lg object-contain"
              />
              <span className="text-sm font-semibold text-[#0C4F81]">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}