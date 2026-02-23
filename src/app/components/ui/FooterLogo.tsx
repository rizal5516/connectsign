import Image from 'next/image'

export default function FooterLogo() {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-10">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
        <Image
          src="/assets/images/logo-blpid.png"
          alt="Logo BLPID"
          width={48}
          height={48}
          className="object-contain w-9 h-9 sm:w-12 sm:h-12"
        />
      </div>
    </div>
  )
}