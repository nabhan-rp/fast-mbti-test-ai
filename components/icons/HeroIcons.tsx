
import React from 'react';

interface IconProps {
  className?: string;
}

export const UserCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const ArrowLeftOnRectangleIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25l-1.25-2.25L13.5 11l2.25-1.25L17 7.5l1.25 2.25L20.5 11l-2.25 1.25z" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.105 0 4.059.568 5.5.972a8.958 8.958 0 005.5-.972A8.987 8.987 0 0118 18V4.262c-.938-.332-1.948-.512-3-.512A8.967 8.967 0 0012 6.042z" />
  </svg>
);

export const BriefcaseIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V14.15M15.75 18.375V16.5a2.25 2.25 0 00-2.25-2.25h-3.75a2.25 2.25 0 00-2.25 2.25v1.875M15.75 12V7.5A2.25 2.25 0 0013.5 5.25h-3A2.25 2.25 0 008.25 7.5V12M12 12h.01M15 12h.01M9 12h.01M3.75 9.75h16.5M3.75 12h16.5" />
  </svg>
);

export const AcademicCapIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5z" />
  </svg>
);

export const LightBulbIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    {/* Simplified path for brevity, original path was complex and duplicated */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311V21m-3.75 0h.008v.008h-.008v-.008zm0 0H9.75m3.75 0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25M12 3.75c-3.452 0-6.25 2.798-6.25 6.25 0 2.726 1.745 5.024 4.09 5.891V18h4.32v-2.109c2.345-.867 4.09-3.165 4.09-5.891 0-3.452-2.798-6.25-6.25-6.25z" />
 </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.066M12 6.75a3.375 3.375 0 100 6.75 3.375 3.375 0 000-6.75zM12 12.75c-1.875 0-3.75-.405-5.287-1.125A2.251 2.251 0 015.25 9.75V9A2.25 2.25 0 017.5 6.75h9A2.25 2.25 0 0118.75 9v.75c0 .41-.12.805-.337 1.125C17.25 12.345 15.375 12.75 12 12.75zM6 16.5a2.25 2.25 0 00-2.25 2.25v.75a2.25 2.25 0 002.25 2.25h12A2.25 2.25 0 0020.25 19.5v-.75a2.25 2.25 0 00-2.25-2.25H6z" />
  </svg>
);

export const ChartBarIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

export const ArrowPathIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 12a2.25 2.25 0 00-2.25 2.25 2.25 2.25 0 002.25 2.25c1.241 0 2.25-1.009 2.25-2.25A2.25 2.25 0 0012 12z" />
  </svg>
);

export const PencilSquareIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const ChatBubbleLeftRightIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.68-3.68A9.74 9.74 0 0112 15.75c-2.138 0-4.12-.707-5.694-1.905l-3.68 3.68v-3.09c-.338-.02-.677-.045-1.017-.072C.847 17.001 0 16.037 0 14.897V10.61c0-.97.616-1.813 1.5-2.097m16.5 0a2.25 2.25 0 00-1.883-2.182 19.722 19.722 0 00-12.234 0A2.25 2.25 0 001.5 8.511M21 10.611v4.286c0 .762-.398 1.434-.996 1.819C19.043 17.29 17.062 18 15 18s-4.043-.71-4.996-1.284A1.985 1.985 0 019 14.897V10.61c0-.762.398-1.434.996-1.819C10.957 8.21 12.938 7.5 15 7.5s4.043.71 4.996 1.284c.598.386.996 1.057.996 1.819z" />
  </svg>
);

export const CubeTransparentIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M14.25 7.756c-.144.02-.287.04-.43.061M14.25 7.756c.144.02.287.04.43.061M14.25 16.244c.144-.02.287-.04.43-.061M14.25 16.244c-.144-.02.287-.04-.43-.061M12 21a9 9 0 100-18 9 9 0 000 18zM12 3.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 3.75zM12 18.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 18.75zM4.558 15.659a.75.75 0 01.933-.515 9.009 9.009 0 005.016 0 .75.75 0 01.933.515c.092.38-.037.787-.323.975a9.009 9.009 0 01-5.238 0c-.286-.188-.415-.595-.323-.975zm0-7.318a.75.75 0 01.933.514 9.009 9.009 0 005.016 0 .75.75 0 01.933-.514c.092-.38-.037-.787-.323-.975a9.009 9.009 0 01-5.238 0c-.286.188-.415-.595-.323.975zM18.442 15.659a.75.75 0 00-.933-.515 9.009 9.009 0 01-5.016 0 .75.75 0 00-.933.515c-.092.38.037.787.323.975a9.009 9.009 0 005.238 0c.286-.188.415-.595.323.975zm0-7.318a.75.75 0 00-.933.514 9.009 9.009 0 01-5.016 0 .75.75 0 00-.933-.514c-.092-.38-.037-.787-.323-.975a9.009 9.009 0 005.238 0c.286.188.415-.595.323.975z" />
  </svg>
);

export const PrinterIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a8.508 8.508 0 0110.56 0m-10.56 0L6 18.75m0-4.921l.72.096M17.28 13.829c.24.03.48.062.72.096m-.72-.096a8.508 8.508 0 00-10.56 0m10.56 0L18 18.75m0-4.921l-.72.096M6 21a2.25 2.25 0 01-2.25-2.25V15m16.5 3.75V18.75A2.25 2.25 0 0018 16.5h-1.5m-12.75 0h1.5M6 16.5H2.25m13.5 0H18m0 0V9a2.25 2.25 0 00-2.25-2.25H8.25A2.25 2.25 0 006 9v7.5M3 16.5h.008v.008H3v-.008zm18 0h-.008v.008h.008v-.008z" />
  </svg>
);

export const ClipboardDocumentIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a8.25 8.25 0 01-8.25 8.25H3.75a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.75 4.5h6.75A2.25 2.25 0 0013.5 2.25H12c1.03 0 1.9.693 2.166 1.638m-3.332 0c.055.194.084.4.084.612v0a8.25 8.25 0 01-8.25 8.25H3.75a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.75 4.5h6.75A2.25 2.25 0 0013.5 2.25H12c1.03 0 1.9.693 2.166 1.638m5.332 0c.055.194.084.4.084.612v0a8.25 8.25 0 01-8.25 8.25h-1.5a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 015.25 4.5h6.75a2.25 2.25 0 012.25 2.25m-6.75 0V6.75c0-.621.504-1.125 1.125-1.125H12a1.125 1.125 0 011.125 1.125v1.125c0 .621-.504 1.125-1.125 1.125H9.375z" />
  </svg>
);