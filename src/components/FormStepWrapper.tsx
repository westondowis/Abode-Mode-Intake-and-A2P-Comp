import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { BrokerAvatar } from './brand/BrokerAvatar';

interface FormStepWrapperProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  onNext?: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
  stepNames?: string[];
}

export const FormStepWrapper: React.FC<FormStepWrapperProps> = ({
  currentStep,
  totalSteps,
  title,
  subtitle,
  onNext,
  onBack,
  isNextDisabled = false,
  nextLabel = 'Next Step',
  isSubmitting = false,
  children,
  stepNames,
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
      {/* Progress Card */}
      <div className="bg-[#00171C] border border-[#0A4251] rounded-2xl p-4 sm:p-6 mb-8 shadow-2xl">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-3">
          <div className="flex items-center gap-2.5">
            <BrokerAvatar size="sm" variant="circle" />
            <span className="text-[#F2C864] uppercase tracking-wider text-xs font-bold">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <span className="text-[#88BBD8] font-mono">{percentage}% completed</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#0A4251]/40 rounded-full overflow-hidden p-0.5 border border-[#0A4251]">
          <div
            className="h-full bg-gradient-to-r from-[#0A4251] via-[#88BBD8] to-[#F2C864] rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(242,200,100,0.4)]"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Optional Step Dots */}
        {stepNames && (
          <div className="hidden sm:grid grid-cols-6 gap-2 mt-4 pt-3 border-t border-[#0A4251]/50">
            {stepNames.map((name, idx) => {
              const stepNumber = idx + 1;
              const isDone = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;

              return (
                <div key={name} className="flex flex-col items-center text-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition-colors ${
                      isDone
                        ? 'bg-[#F2C864] text-[#00171C]'
                        : isCurrent
                        ? 'bg-[#0A4251] border-2 border-[#F2C864] text-[#F2C864]'
                        : 'bg-[#0A4251]/30 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : stepNumber}
                  </div>
                  <span
                    className={`text-[11px] truncate w-full ${
                      isCurrent
                        ? 'text-[#F2C864] font-semibold'
                        : isDone
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Step Content Container */}
      <div className="bg-[#00171C] border border-[#0A4251] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            {title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Form Body */}
        <div className="min-h-[300px] mb-8">{children}</div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#0A4251]/60">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#0A4251] bg-[#00171C] hover:bg-[#0A4251]/30 text-slate-300 hover:text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled || isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F2C864] to-amber-300 hover:from-amber-300 hover:to-[#F2C864] text-[#00171C] font-bold text-sm shadow-xl shadow-[#F2C864]/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#00171C] border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{nextLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
