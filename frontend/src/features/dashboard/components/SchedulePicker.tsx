interface SchedulePickerProps {
  type: string
  date: string
  onTypeChange: (type: string) => void
  onDateChange: (date: string) => void
}

export function SchedulePicker({ type, date, onTypeChange, onDateChange }: SchedulePickerProps) {
  const minDate = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">When to publish</label>
      <div className="flex gap-4">
        {[
          { value: 'now', label: 'Post now' },
          { value: 'schedule', label: 'Schedule for later' },
          { value: 'draft', label: 'Save as draft' },
        ].map((option) => (
          <label key={option.value} className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="publishType"
              value={option.value}
              checked={type === option.value}
              onChange={() => onTypeChange(option.value)}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>

      {type === 'schedule' && (
        <input
          type="datetime-local"
          min={minDate}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="block w-full max-w-sm border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
      )}
    </div>
  )
}
