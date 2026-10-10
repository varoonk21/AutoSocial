import { useState } from "react";
import { Check, ChevronDown, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformIcon } from "@/features/dashboard/components/PlatformIcon";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/constants/platforms";
import { Popover } from "./Popover";
import { getAccountPlatform } from "./accountUtils";
import type { ConnectedAccount, Platform } from "./types";

interface PostToCardProps {
  accounts: ConnectedAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function AccountAvatar({ account, size = 28 }: { account: ConnectedAccount; size?: number }) {
  if (account.picture) {
    return (
      <img
        src={account.picture}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const platform = getAccountPlatform(account);
  return (
    <span
      className="rounded-full flex items-center justify-center text-white font-bold"
      style={{
        width: size,
        height: size,
        backgroundColor: PLATFORM_COLORS[platform],
        fontSize: size / 2.4,
      }}
    >
      {account.name?.charAt(0)?.toUpperCase() || "?"}
    </span>
  );
}

export function PostToCard({ accounts, selectedId, onSelect }: PostToCardProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const selected = accounts.find((a) => a._id === selectedId) || null;
  const grouped = accounts.reduce<Record<string, ConnectedAccount[]>>((acc, account) => {
    const platform = getAccountPlatform(account);
    (acc[platform] ||= []).push(account);
    return acc;
  }, {});

  return (
    <Card className="py-0">
      <CardContent className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground">Post to</label>
          <Button
            variant="ghost"
            size="xs"
            className="h-6 px-2 text-[11px] text-gray-500 hover:text-gray-800"
            onClick={() => navigate("/dashboard/settings")}
          >
            <Settings2 className="w-3 h-3" />
            <span>Manage accounts</span>
          </Button>
        </div>

        {accounts.length === 0 ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-3 py-2.5">
            <p className="text-xs text-gray-500">No connected accounts yet.</p>
            <Button variant="outline" size="xs" onClick={() => navigate("/dashboard/settings")}>
              Connect account
            </Button>
          </div>
        ) : (
          <Popover
            open={open}
            onOpenChange={setOpen}
            trigger={
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-background px-3 py-2 text-left transition-colors hover:border-gray-300 hover:bg-gray-50/60 cursor-pointer"
              >
                {selected ? (
                  <span className="flex items-center gap-2.5 min-w-0">
                    <AccountAvatar account={selected} />
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-foreground truncate">
                        {selected.name}
                      </span>
                      <span className="block text-[10px] text-gray-400">
                        {PLATFORM_LABELS[getAccountPlatform(selected)]}
                      </span>
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-400" />
                    </span>
                    <span className="text-xs text-gray-400">Select an account</span>
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            }
          >
            <div className="w-72 max-h-72 overflow-y-auto space-y-2 py-1">
              {Object.entries(grouped).map(([platform, list]) => (
                <div key={platform}>
                  <div className="flex items-center gap-1.5 px-2 pt-1.5 pb-1">
                    <PlatformIcon platform={platform as Platform} size={13} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      {PLATFORM_LABELS[platform as Platform]}
                    </span>
                  </div>
                  {list.map((account) => {
                    const isActive = account._id === selectedId;
                    return (
                      <button
                        key={account._id}
                        type="button"
                        onClick={() => {
                          onSelect(account._id);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors ${
                          isActive ? "bg-foreground/8" : "hover:bg-gray-50"
                        }`}
                      >
                        <AccountAvatar account={account} size={26} />
                        <span className="flex-1 min-w-0 text-xs font-medium text-gray-800 truncate">
                          {account.name}
                        </span>
                        {isActive && <Check className="w-3.5 h-3.5 text-foreground shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </Popover>
        )}
      </CardContent>
    </Card>
  );
}
