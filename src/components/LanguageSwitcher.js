import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ currentLanguage, onLanguageChange, disabled }) => {
  return (
    <div className='flex items-center gap-2 flex-shrink-0'>
      <Globe className='w-4 h-4 text-blue-200' />

      <select
        value={currentLanguage}
        onChange={(event) => onLanguageChange(event.target.value)}
        disabled={disabled}
        className='bg-transparent text-blue-200 text-sm border border-blue-800 rounded px-2 py-1 outline-none focus:border-blue-600 disabled:opacity-50 cursor-pointer'
      >
        <option value='en' className='bg-blue-900 text-blue-100'>
          EN
        </option>
        <option value='es' className='bg-blue-900 text-blue-100'>
          ES
        </option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
