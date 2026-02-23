import Image from "next/image";

export default function HeaderLogo() {
  return (
    <div className="absolute top-5 left-5 z-50 hidden sm:block">
      <Image
        src="/assets/images/logo-blpid-1.png"
        alt="Balai Layanan Penghubung Identitas Digital"
        width={240}
        height={60}
        className="object-contain h-15 w-auto"
        priority
      />
    </div>
  );
}
