import { useState, useEffect } from "react";
import { apiGet, apiPut, apiDelete } from "@/lib/fetcher";
import { SocialConnect } from "../components/SocialConnect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Plus, Trash2 } from "lucide-react";

function StatusPill({ status }: { status: string }) {
  if (status === "reauth_required") {
    return (
      <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-200">
        Needs re-auth
      </span>
    );
  }
  if (status === "disabled") {
    return (
      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full border border-slate-200">
        Disabled
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 bg-accent text-primary-700 text-xs font-medium rounded-full border border-primary-200">
      Active
    </span>
  );
}

export function ConnectedAccountsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [showConnect, setShowConnect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<any | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    setLoading(true);
    try {
      const data = await apiGet("/integrations/list");
      setIntegrations(data.integrations || []);
    } catch {
      // Error state is rendered below via the empty gate
    } finally {
      setLoading(false);
    }
  }

  const connectedProviders = integrations.map((i) => i.platform);

  const showToast = (kind: "success" | "error", message: string) => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDisable = async (id: string, disabled: boolean) => {
    setBusyId(id);
    try {
      await apiPut(`/integrations/${id}/disable`, { disabled });
      loadIntegrations();
    } catch {
      showToast("error", "Could not update the account. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDisconnectConfirm = async () => {
    if (!disconnectTarget) return;
    setBusyId(disconnectTarget.id);
    try {
      await apiDelete(`/integrations/${disconnectTarget.id}`);
      showToast("success", "Account disconnected.");
      loadIntegrations();
    } catch {
      showToast("error", "Could not disconnect the account. Please try again.");
    } finally {
      setBusyId(null);
      setDisconnectTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast kind={toast.kind} message={toast.message} />}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Connected Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your social media integrations.</p>
        </div>
        <Button onClick={() => setShowConnect(!showConnect)} className="gap-2 shrink-0">
          {!showConnect && <Plus className="w-4 h-4" />}
          {showConnect ? "Hide" : "Add Account"}
        </Button>
      </div>

      {showConnect && (
        <div className="bg-background rounded-xl border border-slate-200 p-6 shadow-soft">
          <SocialConnect connectedProviders={connectedProviders} onConnect={loadIntegrations} />
        </div>
      )}

      {loading ? (
        <div className="bg-background rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-soft">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : integrations.length === 0 && !showConnect ? (
        <div className="bg-background rounded-xl border border-slate-200 p-12 text-center shadow-soft">
          <p className="text-slate-400 text-sm mb-4">No accounts connected yet.</p>
          <Button onClick={() => setShowConnect(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Connect your first account
          </Button>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-soft">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex items-center gap-4 px-6 py-4">
              <img
                src={integration.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(integration.name)}&background=e2e8f0&color=64748b`}
                alt={integration.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{integration.name}</p>
                <p className="text-xs text-slate-400 capitalize">{integration.platform}</p>
              </div>
              <StatusPill status={integration.status} />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === integration.id}
                  onClick={() => handleDisable(integration.id, integration.status !== "disabled")}
                >
                  {integration.status === "disabled" ? "Enable" : "Disable"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Disconnect ${integration.name}`}
                  disabled={busyId === integration.id}
                  onClick={() => setDisconnectTarget(integration)}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!disconnectTarget} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect account?</DialogTitle>
            <DialogDescription>
              {disconnectTarget
                ? `Disconnect ${disconnectTarget.name}? Future scheduled posts to this account will fail.`
                : "Disconnect this account? Future scheduled posts to this account will fail."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDisconnectTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDisconnectConfirm} disabled={!!busyId}>
              {busyId ? "Disconnecting..." : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
