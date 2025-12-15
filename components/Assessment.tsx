import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { AssessmentRecord } from '../types';

interface AssessmentProps {
  onComplete: (record: AssessmentRecord) => void;
}

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself - or that you are a failure",
  "Trouble concentrating on things, such as reading the newspaper",
  "Moving or speaking so slowly that other people could have noticed",
  "Thoughts that you would be better off dead, or of hurting yourself"
];

const OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

export const Assessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<number[]>(new Array(PHQ9_QUESTIONS.length).fill(-1));
  const [completed, setCompleted] = useState(false);

  const handleSelect = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const calculateResult = () => {
    const score = answers.reduce((a, b) => a + (b === -1 ? 0 : b), 0);
    let severity = "None";
    if (score >= 5) severity = "Mild";
    if (score >= 10) severity = "Moderate";
    if (score >= 15) severity = "Moderately Severe";
    if (score >= 20) severity = "Severe";

    const record: AssessmentRecord = {
      id: crypto.randomUUID(),
      type: 'PHQ-9',
      score,
      severity,
      timestamp: Date.now()
    };
    
    setCompleted(true);
    onComplete(record);
  };

  const allAnswered = answers.every(a => a !== -1);

  if (completed) {
    const score = answers.reduce((a, b) => a + b, 0);
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full mb-8 shadow-2xl shadow-emerald-200">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-800 mb-4">Assessment Complete</h2>
        <p className="text-slate-500 mb-10 text-lg">
          Your PHQ-9 Score is <strong className="text-slate-900 text-2xl ml-2">{score}</strong>
        </p>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl inline-block text-left max-w-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center text-lg">
            <AlertCircle size={20} className="mr-2 text-violet-500" />
            Recommendation
          </h3>
          <p className="text-slate-600 leading-loose text-base">
            Based on your responses, we have logged this into your history. 
            {score > 10 
              ? " Your score indicates you might be experiencing meaningful symptoms. We recommend using the Chat feature to talk about it or reaching out to a professional."
              : " Your score suggests valid mental well-being. Keep tracking regularly to maintain your health."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-800">PHQ-9 Assessment</h2>
        <p className="text-slate-500 mt-2 text-lg">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
      </header>

      <div className="space-y-6">
        {PHQ9_QUESTIONS.map((q, qIdx) => (
          <div key={qIdx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <p className="font-semibold text-lg text-slate-800 mb-6 flex">
              <span className="text-violet-500 mr-2">{qIdx + 1}.</span> {q}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(qIdx, opt.value)}
                  className={`py-4 px-4 rounded-2xl text-sm font-bold transition-all border ${
                    answers[qIdx] === opt.value
                      ? 'bg-violet-600 text-white border-violet-600 shadow-xl shadow-violet-100 transform scale-105'
                      : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={calculateResult}
          disabled={!allAnswered}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 flex items-center"
        >
          Submit Assessment
          <ChevronRight className="ml-2" size={20}/>
        </button>
      </div>
    </div>
  );
};