import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  Building, 
  DollarSign, 
  Check, 
  Loader2,
  Trash2,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { Employee, LeaveRequest, PayrollRecord } from '../types';

interface AiAssistantSectionProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  payroll: PayrollRecord[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistantSection({
  employees,
  leaves,
  payroll
}: AiAssistantSectionProps) {
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm **Nellie**, your Virtual CHRO Co-Pilot. 

I can analyze your core personnel data, help you draft customized employment contracts, research federal labor guidelines, or optimize employee onboarding. 

How can I support your operations today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle send message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Gather system state for Gemini server context proxy
      const systemContext = {
        totalEmployeesCount: employees.length,
        departments: Array.from(new Set(employees.map(e => e.department))),
        activePayrollBudget: payroll.reduce((sum, p) => sum + p.netSalary, 0),
        pendingLeavesBacklog: leaves.filter(l => l.status === 'Pending').length,
        employeesOnLeaveToday: employees.filter(e => e.status === 'On Leave').length,
        topDepartment: employees.reduce((max, e) => {
          max[e.department] = (max[e.department] || 0) + 1;
          return max;
        }, {} as { [key: string]: number })
      };

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          previousMessages: messages.slice(-10), // pass last 10 messages for continuous memory context
          systemContext
        })
      });

      if (!response.ok) throw new Error("Nellie service is temporarily unreachable.");

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ **Operational Sync Issue**\n\nI was unable to establish connection with my central brain core. Error: ${err.message || 'Gemini API not active'}. \n\nPlease verify that your \`GEMINI_API_KEY\` is correctly set up in the AI Studio Secrets panel!` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  // Quick prompt triggers
  const promptTemplates = [
    {
      title: "Draft Hybrid Schedule Policy",
      prompt: "Can you draft a standard hybrid work hours and office attendance policy suitable for an Engineering company of 25 staff members?"
    },
    {
      title: "Engineer Interview Plan",
      prompt: "Prepare a typical interview framework with 5 technical and behavioral assessment questions for a 'Senior Lead Architect' hiring process."
    },
    {
      title: "Analyze Company Health",
      prompt: "Analyze our current company parameters based on the system context stats. Tell me if my HR liabilities, employee allocations, or leave ratios require special warnings or adjustments."
    },
    {
      title: "Explain Grievance Paths",
      prompt: "What are the standard compliance steps/procedures for an HR Director to handle workplace disputes or harassment complaints objectively?"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Templates rail on Left */}
      <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Co-Pilot Prompts</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
            Click any core scenario preset to instantly run a Nellie AI legal-compliance evaluation on your company.
          </p>

          <div className="space-y-2.5">
            {promptTemplates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(tpl.prompt)}
                disabled={loading}
                className="w-full text-left p-3 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition flex items-center justify-between group disabled:opacity-50 cursor-pointer"
              >
                <span className="truncate pr-2">{tpl.title}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Clear History trigger */}
        <div className="border-t border-slate-50 pt-4 text-center">
          <button
            onClick={() => {
              if (confirm("Reset conversation timeline?")) {
                setMessages([
                  {
                    role: 'assistant',
                    content: "Timeline reset. Hello! I'm Nellie. How can I help support your HR operations today?"
                  }
                ]);
              }
            }}
            className="text-[10px] uppercase font-bold tracking-wider text-rose-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Chat History
          </button>
        </div>

      </div>

      {/* Main interactive Chat console on Right */}
      <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl h-[560px] flex flex-col justify-between overflow-hidden shadow-xs">
        
        {/* Chat header */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 border text-white font-mono flex items-center justify-center font-black text-sm relative">
              S
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></span>
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-800">Nellie CHRO Co-Pilot</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Company Virtual Advisor • ONLINE</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500">
            <Bookmark className="w-3 h-3 text-indigo-500" /> Auto-sync context active
          </div>
        </div>

        {/* Messages timeline area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={index} 
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-100 border flex items-center justify-center font-bold text-slate-600 text-xs flex-shrink-0 font-mono">
                    🤖
                  </div>
                )}
                <div 
                  className={`p-4 rounded-2xl text-xs leading-relaxed font-medium ${isUser ? 'bg-slate-900 text-white rounded-tr-none text-right font-sans' : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none font-sans whitespace-pre-wrap'}`}
                >
                  {/* Simplistic formatting helper to convert markdown bold in assistant text */}
                  {msg.content.split('\n').map((line, i) => {
                    // Check for lists or markdown bold format
                    let formatted = line;
                    
                    // Simple replacement of markdown patterns for clean UI render
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const bulletRegex = /^\*\s+(.*)/;

                    return (
                      <p key={i} className="mb-1 last:mb-0">
                        {line.startsWith('* ') ? (
                          <span className="flex items-start gap-1.5 pl-2 mt-1">
                            <span className="text-indigo-500 flex-shrink-0 mt-1">•</span>
                            <span>{line.substring(2).replace(boldRegex, '$1')}</span>
                          </span>
                        ) : line.startsWith('- ') ? (
                          <span className="flex items-start gap-1.5 pl-2 mt-1">
                            <span className="text-indigo-500 flex-shrink-0 mt-1">•</span>
                            <span>{line.substring(2).replace(boldRegex, '$1')}</span>
                          </span>
                        ) : (
                          // inline bold parsing helper
                          line.split('**').map((chunk, j) => j % 2 === 1 ? <strong key={j} className="font-extrabold text-slate-950">{chunk}</strong> : chunk)
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Thinking Dot loading state */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-7 h-7 rounded-sm bg-slate-100 border flex items-center justify-center font-bold text-slate-500 text-[10px] flex-shrink-0 font-mono">
                🤖
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-400 italic text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" /> Nellie reflecting on labor codes and data patterns...
              </div>
            </div>
          )}

          <div ref={scrollRef}></div>
        </div>

        {/* Input box */}
        <form onSubmit={handleFormSubmit} className="border-t border-slate-100 p-4 bg-slate-50 flex gap-3">
          <input
            type="text"
            required
            disabled={loading}
            placeholder="Ask Nellie guidelines, employee compliance questions, or request drafts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-white border border-slate-200 pl-4 pr-4 py-2.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-slate-900 border hover:bg-slate-800 text-white p-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
}
