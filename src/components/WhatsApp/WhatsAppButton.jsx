import React from 'react';

const WhatsAppButton = ({ 
  phone = '966558576060', 
  message = '', 
  size = 'normal',
  position = 'inline',
  className = '',
  children 
}) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  const sizes = {
    small: 'px-3 py-2 text-sm',
    normal: 'px-5 py-2.5 text-base',
    large: 'px-6 py-3 text-lg'
  };

  if (position === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 left-6 z-50 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 flex items-center justify-center ${sizes[size]} ${className}`}
      >
        <span className="text-xl ml-2">💬</span>
        {children || 'واتساب'}
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg ${sizes[size]} ${className}`}
    >
      <span className="text-xl">💬</span>
      {children || 'تواصل عبر واتساب'}
    </a>
  );
};

export default WhatsAppButton;
