(function () {
  if (window.__CHATBOT_WIDGET__) return;
  window.__CHATBOT_WIDGET__ = true;

  // Create chatbot open button
  const button = document.createElement('div');
  button.innerText = '💬 Chat';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #007bff;
    color: white;
    padding: 12px 16px;
    border-radius: 24px;
    cursor: pointer;
    z-index: 9999;
    font-family: sans-serif;
  `;
  document.body.appendChild(button);

  // Create full-screen modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: white;
    display: none;
    z-index: 9998;
  `;
  modal.innerHTML = `
    <iframe src="https://mychatbot.vercel.app" style="width:100%; height:100%; border:none;"></iframe>
  `;
  document.body.appendChild(modal);

  // Toggle modal
  button.onclick = () => (modal.style.display = 'block');
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.style.display = 'none';
  });
})();
