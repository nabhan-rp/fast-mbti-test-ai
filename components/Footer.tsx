
import React from 'react';
import { APP_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-bground-light py-8 text-center text-content-muted border-t border-neutral/20 no-print">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p className="text-sm mt-1">Discover yourself and unlock your potential.</p>
      </div>
    </footer>
  );
};

export default Footer;