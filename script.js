window.addEventListener('load', () => {
    const libScript = document.createElement('script');
    libScript.src = 'additional-code/purify.min.js';
    document.body.appendChild(libScript)
    const script1 = document.createElement('script');
    script1.src = 'program.js';
    document.body.appendChild(script1)
    const script2 = document.createElement('script');
    script2.src = 'standard_module/standard_module.js';
    document.body.appendChild(script2)
})