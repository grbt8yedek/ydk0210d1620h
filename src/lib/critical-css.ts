/**
 * Critical CSS Implementation
 * Above-the-fold CSS'i inline olarak yerleştirmek için
 */

// Above-the-fold için kritik CSS blokları
export const criticalCSS = `
  /* Reset ve base stilleri */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html, body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.5;
  }
  
  /* Header ve navigation için kritik stiller */
  .header-critical {
    position: relative;
    z-index: 50;
    background: white;
    border-bottom: 1px solid #e5e7eb;
  }
  
  /* Hero section için temel stiller */
  .hero-critical {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 0;
    min-height: 400px;
  }
  
  /* Flight search box kritik stiller */
  .search-box-critical {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin: 2rem auto;
    max-width: 1000px;
  }
  
  /* Buton kritik stiller */
  .btn-critical {
    background: #22c55e;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
  }
  
  .btn-critical:hover {
    background: #16a34a;
  }
  
  /* Loading spinner */
  .loading-critical {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #22c55e;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Grid layout temel */
  .grid-critical {
    display: grid;
    gap: 1rem;
  }
  
  @media (min-width: 768px) {
    .grid-critical {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .grid-critical {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  /* Text utilities */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  
  /* Margin/Padding utilities - sadece kritik olanlar */
  .mt-4 { margin-top: 1rem; }
  .mb-4 { margin-bottom: 1rem; }
  .p-4 { padding: 1rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
  
  /* Flexbox utilities */
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  
  /* Width utilities */
  .w-full { width: 100%; }
  .max-w-4xl { max-width: 56rem; }
  .mx-auto { margin-left: auto; margin-right: auto; }
  
  /* Font utilities */
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .text-lg { font-size: 1.125rem; }
  .text-xl { font-size: 1.25rem; }
  .text-2xl { font-size: 1.5rem; }
  .text-3xl { font-size: 1.875rem; }
`;

/**
 * Critical CSS'i head'e inline olarak enjekte eder
 */
export const injectCriticalCSS = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.appendChild(style);
  }
};

/**
 * Critical CSS için HTML head'e yerleştirilecek string
 */
export const getCriticalCSSString = () => {
  return `<style data-critical="true">${criticalCSS}</style>`;
};

/**
 * Ana CSS dosyasının lazy loading için preload
 */
export const preloadMainCSS = () => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link') as HTMLLinkElement;
    link.rel = 'preload';
    link.href = '/_next/static/css/styles.css';
    link.as = 'style';
    link.onload = function() {
      (this as HTMLLinkElement).onload = null;
      (this as HTMLLinkElement).rel = 'stylesheet';
    };
    document.head.appendChild(link);

    // Fallback
    const noscript = document.createElement('noscript');
    const fallbackLink = document.createElement('link') as HTMLLinkElement;
    fallbackLink.rel = 'stylesheet';
    fallbackLink.href = '/_next/static/css/styles.css';
    noscript.appendChild(fallbackLink);
    document.head.appendChild(noscript);
  }
};
