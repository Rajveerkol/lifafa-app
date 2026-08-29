import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Button } from '../../components/common/Button';
import { CustomizeMiniAppSection } from '../../components/bot/CustomizeMiniAppSection';
import { SUPPORT_FAQS } from '../../services/supportService';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Headphones,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Bot,
  Wallet,
  Radio,
  Share2,
  Code2,
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq_1');

  const categories = [
    { key: 'all', label: 'All FAQs', icon: HelpCircle },
    { key: 'connection', label: 'Bot Connection', icon: Bot },
    { key: 'channels', label: 'Channel Locks', icon: Share2 },
    { key: 'broadcast', label: 'Broadcasts', icon: Radio },
    { key: 'wallet', label: 'Wallet & Plans', icon: Wallet },
    { key: 'miniapp', label: 'Mini App UI', icon: Code2 },
  ];

  const filteredFaqs =
    selectedCategory === 'all'
      ? SUPPORT_FAQS
      : SUPPORT_FAQS.filter((f) => f.category === selectedCategory);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">
                Customer Support & Help
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Documentation, troubleshooting guides & developer contact
              </p>
            </div>
          </div>
        </div>

        {/* Developer Contact Banner */}
        <CustomizeMiniAppSection />

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Frequently Asked Questions
          </h3>

          <div className="space-y-2">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
