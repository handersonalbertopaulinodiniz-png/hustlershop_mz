// Error Page Module
export const initErrorPage = (errorCode, errorMessage) => {
    const container = document.getElementById('error-content');
    if (!container) return;

    const messages = {
        '404': {
            title: 'Page Not Found',
            description: 'The page you are looking for does not exist.'
        },
        '403': {
            title: 'Access Denied',
            description: 'You do not have permission to access this page.'
        },
        '500': {
            title: 'Server Error',
            description: 'Something went wrong on our end. Please try again later.'
        }
    };

    const error = messages[errorCode] || messages['500'];

    container.innerHTML = `
    <div class="error-container">
      <div class="error-code">${errorCode}</div>
      <h1 class="error-title">${error.title}</h1>
      <p class="error-description">${errorMessage || error.description}</p>
      <div class="error-actions">
        <a href="/" class="btn btn-primary">Go Home</a>
        <button onclick="history.back()" class="btn btn-secondary">Go Back</button>
      </div>
    </div>
  `;
};

export default { initErrorPage };
