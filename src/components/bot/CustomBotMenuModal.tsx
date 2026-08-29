import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { botService } from '../../services/botService';
import { MenuItem } from '../../types';
import { Plus, Trash2, Link as LinkIcon, Terminal, ShieldCheck } from 'lucide-react';

interface CustomBotMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  initialMenuItems?: MenuItem[];
  onSaved?: () => void;
}

export const CustomBotMenuModal: React.FC<CustomBotMenuModalProps> = ({
  isOpen,
  onClose,
  botId,
  initialMenuItems = [],
  onSaved,
}) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems);
  const [btnName, setBtnName] = useState('');
  const [btnType, setBtnType] = useState<'command' | 'url'>('url');
  const [btnValue, setBtnValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddButton = () => {
    if (!btnName.trim()) {
      showToast('Button name cannot be empty.', 'warning');
      return;
    }
    if (!btnValue.trim()) {
      showToast('Button value cannot be empty.', 'warning');
      return;
    }

    if (btnType === 'url') {
      if (!btnValue.trim().toLowerCase().startsWith('https://')) {
        showToast('Button URL must use secure https:// protocol.', 'error');
        return;
      }
    } else if (btnType === 'command') {
      if (!btnValue.trim().startsWith('/')) {
        showToast('Command must start with a slash (e.g. /help).', 'warning');
        return;
      }
    }

    setItems([...items, { name: btnName.trim(), type: btnType, value: btnValue.trim() }]);
    setBtnName('');
    setBtnValue('');
  };

  const handleRemoveButton = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSaveMenu = async () => {
    setIsSubmitting(true);
    try {
      const res = await botService.updateCustomMenu(botId, items);
      if (res.error) {
        showToast(res.error.message || 'Failed to save menu.', 'error');
        return;
      }

      showToast('Custom bot menu saved successfully!', 'success');
      onSaved?.();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Bot Menu Builder"
      subtitle="Configure inline reply buttons for your Telegram bot"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Add New Button Card */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <span className="text-xs font-bold text-slate-700 block">Add New Menu Button</span>

          <Input
            label="Button Label"
            placeholder="e.g. Visit Website or Get Help"
            value={btnName}
            onChange={(e) => setBtnName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Button Type</label>
              <select
                value={btnType}
                onChange={(e) => setBtnType(e.target.value as 'command' | 'url')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="url">Website URL (HTTPS)</option>
                <option value="command">Bot Command (/command)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {btnType === 'url' ? 'HTTPS Target URL' : 'Command Trigger'}
              </label>
              <input
                type="text"
                placeholder={btnType === 'url' ? 'https://example.com' : '/help'}
                value={btnValue}
                onChange={(e) => setBtnValue(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            fullWidth
            onClick={handleAddButton}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add to Menu
          </Button>
        </div>

        {/* Existing Buttons List */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Configured Buttons ({items.length})</span>

          {items.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No custom buttons configured yet.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.type === 'url' ? (
                      <LinkIcon className="w-4 h-4 text-blue-500 shrink-0" />
                    ) : (
                      <Terminal className="w-4 h-4 text-indigo-500 shrink-0" />
                    )}
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-slate-800 truncate">{item.name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono truncate block">
                        {item.value}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveButton(idx)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save CTA */}
        <div className="pt-2">
          <Button fullWidth size="lg" onClick={handleSaveMenu} isLoading={isSubmitting}>
            Save Menu Configuration
          </Button>

          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strictly validates HTTPS URLs; blocks executable scripts.</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
