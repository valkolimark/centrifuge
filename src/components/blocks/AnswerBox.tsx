// AnswerBox: 40–60 word plain-language direct answer placed directly under the H1
// on service/OEM/industry/how-it-works pages (Definition of Done + AEO layer).
// The answer text is also fed into the page's FAQPage/Service schema by the page.
export function AnswerBox({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border-l-4 border-blue bg-steel-100 p-5">
      <p className="mb-1 text-sm font-semibold text-navy">{question}</p>
      <p className="text-[1.05rem] leading-relaxed text-steel-700">{children}</p>
    </div>
  )
}
