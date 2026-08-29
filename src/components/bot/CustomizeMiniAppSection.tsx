import React from 'react';
import { Send, Code2, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '../common/Button';

interface CustomizeMiniAppSectionProps {
  botUsername?: string;
  botId?: string;
  orderId?: string;
  planName?: string;
}

export const CustomizeMiniAppSection: React.FC<CustomizeMiniAppSectionProps> = ({
  botUsername = '@YourBot_bot',
  botId = 'BOT-768912',
  orderId = 'ORD-CL100',
  planName = 'Basic Bot',
}) => {
  const handleContactDeveloper = () => {
    const rawMessage = `Hi, I want to customize my Mini App.\n\nBot: ${botUsername}\nBot ID: ${botId}\nOrder ID: ${orderId}\nPlan: ${planName}\n\nCustomization Request:\n[Please describe your requirements]\n\nPlease share customization options and pricing.`;
    const encoded = encodeURIComponent(rawMessage);
    const tgUrl = `https://t.me/Rajveer_0711?text=${encoded}`;
    window.open(tgUrl, '_blank');
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-5 sm:p-6 shadow-xl shadow-indigo-950/30 relative overflow-hidden border border-indigo-700/30">
      {/* Background accents */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 backdrop-blur-xs border border-blue-400/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-300">
              <Sparkles className="w-3 h-3 text-amber-300" /> Developer Service
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Customize Mini App UI & Design
            </h3>
          </div>
        </div>

        <p className="text-xs text-blue-100/90 leading-relaxed max-w-lg">
          Want to change your Mini App theme, add custom games, customize registration flows, or add proprietary API integrations? Contact the official developer directly for bespoke design and implementation.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            size="md"
            variant="white"
            onClick={handleContactDeveloper}
            leftIcon={<Send className="w-4 h-4 text-blue-600 fill-current" />}
            className="font-bold shadow-md shadow-black/20"
          >
            Contact Developer (@Rajveer_0711)
          </Button>

          <span className="text-[11px] text-blue-200/80 flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> Fast response via Telegram
          </span>
        </div>
      </div>
    </div>
  );
};
