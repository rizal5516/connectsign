import { STEPS } from '../../constants/signing.constant'
import type { Step } from '../../types/signing.type'

interface Props {
  currentStep: Step
}

export default function StepBreadcrumb({ currentStep }: Props) {
  return (
    <div className="absolute top-6 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full flex justify-center mb-8 sm:mb-10 mt-4 sm:mt-6">
        <div className="flex items-center justify-between w-full max-w-[90%] sm:max-w-2xl relative">
          {STEPS.map((item, index) => (
            <div key={item.id} className="flex flex-col items-center flex-1 relative">
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-[2px] z-0 transition-colors duration-300 ${
                    currentStep > item.id ? 'bg-[#2FAAE1]' : 'bg-gray-200'
                  }`}
                />
              )}

              <div
                className={`z-10 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  currentStep === item.id
                    ? 'bg-gradient-to-r from-[#0C4F81] to-[#2FAAE1] text-white shadow-md'
                    : currentStep > item.id
                    ? 'bg-[#2FAAE1] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {item.id}
              </div>

              <p
                className={`mt-2 text-[10px] sm:text-xs font-medium text-center ${
                  currentStep >= item.id ? 'text-[#0C4F81]' : 'text-gray-400'
                }`}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}