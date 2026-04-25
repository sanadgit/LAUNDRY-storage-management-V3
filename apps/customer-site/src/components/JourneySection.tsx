import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Milestone } from 'lucide-react';
import { JOURNEY_STEPS } from '../constants';

export const JourneySection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 bg-white" id="journey">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">رحلة ملابسك معنا</h2>
          <p className="text-gray-600 font-medium font-display uppercase tracking-widest text-xs">اضغط على كل مرحلة لمعرفة التفاصيل</p>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 mb-16 overflow-x-auto pb-4 px-2">
          {JOURNEY_STEPS.map((step, idx) => (
            <React.Fragment key={idx}>
              <button
                onClick={() => setActiveStep(idx)}
                className="flex flex-col items-center gap-4 group cursor-pointer min-w-[100px] flex-1"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  activeStep === idx 
                    ? 'border-primary bg-primary/5 text-primary scale-110 shadow-lg' 
                    : 'border-gray-100 bg-white text-gray-300 hover:border-gray-300'
                }`}>
                  <span className="text-2xl">{step.key}</span>
                </div>
                <span className={`text-[11px] font-bold transition-colors ${activeStep === idx ? 'text-primary' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </button>
              {idx < JOURNEY_STEPS.length - 1 && (
                <div className={`hidden md:block h-0.5 flex-1 min-w-[20px] transition-colors duration-500 ${
                  idx < activeStep ? 'bg-primary' : 'bg-gray-100'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass p-8 md:p-12 rounded-[3rem] border-primary/10 max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className={`w-24 h-24 ${JOURNEY_STEPS[activeStep].color} text-white rounded-3xl flex items-center justify-center text-4xl shadow-2xl`}>
                {JOURNEY_STEPS[activeStep].key}
              </div>
              <div className="flex-1 text-center md:text-right">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{JOURNEY_STEPS[activeStep].fullLabel}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                  {JOURNEY_STEPS[activeStep].chips.map((chip, idx) => (
                    <span key={idx} className="bg-primary/5 text-primary border border-primary/10 px-4 py-1.5 rounded-full text-xs font-bold">
                      {chip}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {JOURNEY_STEPS[activeStep].note}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
