import type { Signer, SignerStatus } from "../types/signing.type";

interface Props {
  signerList: Signer[];
  currentSignerIndex: number;
}

const STATUS_STYLES: Record<SignerStatus, string> = {
  done: "bg-green-50 border-green-300",
  progress: "bg-blue-50 border-[#2FAAE1]",
  waiting: "bg-gray-50 border-gray-200",
};

const AVATAR_STYLES: Record<SignerStatus, string> = {
  done: "bg-green-500 text-white",
  progress: "bg-[#2FAAE1] text-white",
  waiting: "bg-gray-300 text-gray-600",
};

const STATUS_LABEL: Record<SignerStatus, string> = {
  done: "Selesai",
  progress: "On Progress",
  waiting: "Waiting",
};

function StatusIcon({ status }: { status: SignerStatus }) {
  if (status === "done")
    return <span className="text-green-600 font-bold">✔</span>;
  if (status === "progress")
    return <span className="animate-spin text-[#2FAAE1]">⟳</span>;
  return <span className="text-gray-400">…</span>;
}

export default function SignerSidebar({
  signerList,
  currentSignerIndex,
}: Props) {
  const getStatus = (index: number): SignerStatus => {
    if (index < currentSignerIndex) return "done";
    if (index === currentSignerIndex) return "progress";
    return "waiting";
  };

  return (
    <div className="flex-[0.25] bg-[#FFFDF8] rounded-3xl shadow-xl border border-[#2FAAE1]/30 p-5 self-start mt-2">
      <h3 className="text-lg font-extrabold text-[#0C4F81] mb-4">
        Penandatangan
      </h3>

      <div className="space-y-3">
        {signerList.map((signer, idx) => {
          const status = getStatus(idx);
          return (
            <div
              key={signer.nik}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${STATUS_STYLES[status]}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${AVATAR_STYLES[status]}`}
                >
                  {idx + 1}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#0C4F81]">
                    {signer.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {STATUS_LABEL[status]}
                  </span>
                </div>
              </div>
              <StatusIcon status={status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
