import { PlaneTakeoff } from 'lucide-react'

interface SearchButtonProps {
  loading: boolean
  disabled?: boolean
  onSearch: () => void
  className?: string
}

export default function SearchButton({
  loading,
  disabled = false,
  onSearch,
  className = ''
}: SearchButtonProps) {
  const isDisabled = loading || disabled

  return (
    <button
      type="submit"
      onClick={onSearch}
      disabled={isDisabled}
      className={`
        w-full bg-gradient-to-r from-green-500 to-green-600 text-white 
        py-3 px-6 rounded-xl font-semibold text-lg
        hover:from-green-600 hover:to-green-700 
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Aranıyor...
        </>
      ) : (
        <>
          <PlaneTakeoff className="w-5 h-5" />
          Uçuş Ara
        </>
      )}
    </button>
  )
}
