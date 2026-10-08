import { Check, AlertCircle, Info } from "lucide-react";
import { useCreatePost } from "../components/create-post/useCreatePost";
import { AccountSelectCard } from "../components/create-post/AccountSelectCard";
import { MediaCard } from "../components/create-post/MediaCard";
import { PostDetailsCard } from "../components/create-post/PostDetailsCard";
import { ScheduleCard } from "../components/create-post/ScheduleCard";
import { ActionBar } from "../components/create-post/ActionBar";
import { PostPreview } from "../components/create-post/PostPreview";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function CreatePost() {
  const {
    // Accounts
    accounts,
    selectedAccountIds,
    selectedAccounts,
    toggleAccount,

    // Media
    mediaList,
    addMedia,
    removeMedia,
    reorderMedia,

    // Post details
    isAdPost,
    setIsAdPost,
    text,
    setText,
    language,
    setLanguage,
    applyAiRewrite,
    undoAiRewrite,
    canUndoAi,

    // Schedule
    isScheduleOn,
    setIsScheduleOn,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    timezone,
    setTimezone,

    // Action Bar & Save
    isSaving,
    lastSaved,
    handlePublish,
    handleCancel,

    // Preview
    activePreviewPlatform,
    setActivePreviewPlatform,
    viewMode,
    setViewMode,
    isPreviewDrawerOpen,
    setIsPreviewDrawerOpen,
    activePlatformConfig,

    // Validation & Toast
    validationErrors,
    toastMessage,
    cardRefs,
  } = useCreatePost();

  const isFormValid =
    selectedAccountIds.length > 0 && (text.trim().length > 0 || mediaList.length > 0);
  const primaryAccount =
    selectedAccounts.find((a) => a.provider === activePreviewPlatform) ||
    selectedAccounts[0] ||
    accounts.find((a) => a.provider === activePreviewPlatform) ||
    accounts[0];

  return (
    <div className="-m-8 p-6 lg:p-8 min-h-screen bg-gradient-to-br from-pink-50/60 via-purple-50/35 to-emerald-50/35 text-gray-900 selection:bg-[#0A7CFF]/20 relative pb-28">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1c2b36] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage.type === "success" && (
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          )}
          {toastMessage.type === "error" && (
            <AlertCircle className="w-4 h-4 text-red-400 stroke-[3]" />
          )}
          {toastMessage.type === "info" && <Info className="w-4 h-4 text-blue-400 stroke-[3]" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto space-y-5">
        {/* Page Title Header (Above Left Column) */}
        <div className="pb-1 border-b border-gray-200/60 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1c2b36] tracking-tight">Create post</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Draft, customize, and publish content across Meta and social networks.
            </p>
          </div>
        </div>

        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (~45%): Stack of white rounded cards in independent scroll container */}
          <div className="lg:col-span-6 space-y-4 max-h-[calc(100vh-170px)] overflow-y-auto pr-1 sm:pr-2 scrollbar-none">
            {/* Card 1: Post to */}
            <AccountSelectCard
              accounts={accounts}
              selectedIds={selectedAccountIds}
              onToggleAccount={toggleAccount}
              error={validationErrors.accounts}
              cardRef={cardRefs.accounts}
            />

            {/* Card 2: Media */}
            <MediaCard
              mediaList={mediaList}
              onAddMedia={addMedia}
              onRemoveMedia={removeMedia}
              onReorderMedia={reorderMedia}
              error={validationErrors.media}
              cardRef={cardRefs.media}
            />

            {/* Card 3: Post details */}
            <PostDetailsCard
              text={text}
              onChangeText={setText}
              mediaList={mediaList}
              isAdPost={isAdPost}
              onToggleAdPost={setIsAdPost}
              language={language}
              onChangeLanguage={setLanguage}
              maxCharacters={activePlatformConfig.maxCharacters}
              platformName={activePlatformConfig.name}
              onApplyAiRewrite={applyAiRewrite}
              onUndoAi={undoAiRewrite}
              canUndoAi={canUndoAi}
              error={validationErrors.content}
              cardRef={cardRefs.postDetails}
            />

            {/* Card 4: Schedule */}
            <ScheduleCard
              isScheduleOn={isScheduleOn}
              onToggleSchedule={setIsScheduleOn}
              date={scheduleDate}
              onChangeDate={setScheduleDate}
              time={scheduleTime}
              onChangeTime={setScheduleTime}
              timezone={timezone}
              onChangeTimezone={setTimezone}
              error={validationErrors.schedule}
              cardRef={cardRefs.schedule}
            />
          </div>

          {/* RIGHT COLUMN (~55%): Fixed/Sticky Live Preview & Action Bar */}
          <div className="hidden lg:block lg:col-span-6 space-y-4 sticky top-20">
            <PostPreview
              activePlatformId={activePreviewPlatform}
              onSelectPlatform={setActivePreviewPlatform}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              account={primaryAccount}
              text={text}
              mediaList={mediaList}
            />

            {/* Action Bar Sitting Directly Under Preview */}
            <ActionBar
              isScheduleOn={isScheduleOn}
              isSaving={isSaving}
              lastSaved={lastSaved}
              isValid={isFormValid}
              onCancel={handleCancel}
              onSaveDraft={() => handlePublish("draft")}
              onPublish={() => handlePublish(isScheduleOn ? "schedule" : "publish")}
              variant="inline"
            />
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <ActionBar
        isScheduleOn={isScheduleOn}
        isSaving={isSaving}
        lastSaved={lastSaved}
        isValid={isFormValid}
        onCancel={handleCancel}
        onSaveDraft={() => handlePublish("draft")}
        onPublish={() => handlePublish(isScheduleOn ? "schedule" : "publish")}
        onOpenMobilePreview={() => setIsPreviewDrawerOpen(true)}
        variant="fixed"
      />

      {/* Mobile Live Preview Drawer (< 1024px) */}
      <Sheet open={isPreviewDrawerOpen} onOpenChange={setIsPreviewDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-4 overflow-y-auto bg-gray-50">
          <SheetHeader className="pb-2 border-b border-gray-200">
            <SheetTitle className="text-base font-bold text-[#1c2b36]">Post Preview</SheetTitle>
          </SheetHeader>
          <div className="pt-4">
            <PostPreview
              activePlatformId={activePreviewPlatform}
              onSelectPlatform={setActivePreviewPlatform}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              account={primaryAccount}
              text={text}
              mediaList={mediaList}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
