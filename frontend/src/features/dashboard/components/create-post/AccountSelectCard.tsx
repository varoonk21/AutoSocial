import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown, Plus, ShieldAlert } from "lucide-react";
import { AccountItem } from "./useCreatePost";
import { PLATFORMS_CONFIG } from "./platformConfig";
import { FacebookLogo, InstagramLogo } from "./PlatformIcons";
import { Card, CardContent } from "@/components/ui/card";

interface AccountSelectCardProps {
  accounts: AccountItem[];
  selectedIds: string[];
  onToggleAccount: (id: string) => void;
  error?: string;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export function AccountSelectCard({
  accounts,
  selectedIds,
  onToggleAccount,
  error,
  cardRef,
}: AccountSelectCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedAccounts = accounts.filter((a) => selectedIds.includes(a.id));

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>, acc: AccountItem) => {
    const img = e.currentTarget;
    if (acc.internalId && !img.dataset.triedGraph) {
      img.dataset.triedGraph = "true";
      img.src = `https://graph.facebook.com/${acc.internalId}/picture?type=large`;
      return;
    }
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.name)}&background=0A7CFF&color=fff`;
  };

  const renderBadge = (provider: string) => {
    if (provider === "facebook") {
      return <FacebookLogo className="w-3.5 h-3.5" />;
    }
    return <InstagramLogo className="w-3.5 h-3.5" />;
  };

  return (
    <div ref={cardRef}>
      <Card className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-visible">
        <CardContent className="p-4 space-y-3 overflow-visible">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Post to</h2>
          </div>

          {accounts.length === 0 ? (
            /* No Accounts Connected State */
            <div className="rounded-lg border border-dashed border-gray-300 p-3.5 text-center bg-gray-50/50 space-y-1.5">
              <p className="text-xs text-slate-500">No social media accounts connected yet.</p>
              <Link
                to="/dashboard/connected-accounts"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A7CFF] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Connect account
              </Link>
            </div>
          ) : (
            /* Custom Dropdown with Multi-Select & Avatar Stack Trigger */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                aria-label="Select social accounts to post to"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg border transition-all text-left bg-white cursor-pointer ${
                  error
                    ? "border-red-500 ring-2 ring-red-100"
                    : isOpen
                    ? "border-[#0A7CFF] ring-2 ring-[#0A7CFF]/10"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Overlapping Avatar Stack Trigger */}
                  {selectedAccounts.length > 0 ? (
                    <div className="flex items-center">
                      <div className="flex -space-x-1.5 overflow-hidden py-0.5">
                        {selectedAccounts.slice(0, 3).map((acc) => {
                          return (
                            <div key={acc.id} className="relative inline-block shrink-0">
                              <img
                                src={acc.avatar}
                                alt={acc.name}
                                referrerPolicy="no-referrer"
                                onError={(e) => handleAvatarError(e, acc)}
                                className="w-7 h-7 rounded-full border-2 border-white object-cover bg-gray-100"
                              />
                              <span className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-[1px] flex items-center justify-center">
                                {renderBadge(acc.provider)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {selectedAccounts.length > 3 && (
                        <span className="ml-2 text-xs font-medium text-slate-500">
                          +{selectedAccounts.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Select accounts to post to...</span>
                  )}

                  {/* Account Name Label */}
                  {selectedAccounts.length === 1 && (
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 truncate">{selectedAccounts[0].name}</p>
                      <p className="text-[11px] text-slate-500">{selectedAccounts[0].handle}</p>
                    </div>
                  )}
                </div>

                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#0A7CFF]" : ""}`} />
              </button>

              {/* Dropdown Menu Popup */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-lg border border-gray-200 bg-white shadow-md py-1 max-h-64 overflow-y-auto animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Connected Accounts</span>
                    <span>Select Multiple</span>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {accounts.map((acc) => {
                      const isSelected = selectedIds.includes(acc.id);
                      const pConfig = PLATFORMS_CONFIG[acc.provider] || PLATFORMS_CONFIG.facebook;

                      return (
                        <div
                          key={acc.id}
                          onClick={() => onToggleAccount(acc.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                            isSelected ? "bg-[#0A7CFF]/5 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={acc.avatar}
                                alt={acc.name}
                                referrerPolicy="no-referrer"
                                onError={(e) => handleAvatarError(e, acc)}
                                className="w-7 h-7 rounded-full object-cover border border-gray-200 bg-gray-100"
                              />
                              <span className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-[1px] flex items-center justify-center">
                                {renderBadge(acc.provider)}
                              </span>
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-900 leading-tight truncate">{acc.name}</p>
                              <p className="text-[11px] text-slate-500 truncate">{pConfig.name} {acc.handle ? `• ${acc.handle}` : ""}</p>
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? "border-[#0A7CFF] bg-[#0A7CFF] text-white" : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-gray-100 bg-slate-50/50 flex justify-between items-center text-xs">
                    <Link
                      to="/dashboard/connected-accounts"
                      className="text-[11px] font-semibold text-[#0A7CFF] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Connect new account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium pt-0.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
