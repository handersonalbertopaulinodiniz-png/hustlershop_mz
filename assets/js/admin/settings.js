import { initAdminPage } from './common.js';
import { showToast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initAdminPage();
    setupSettingsHandlers();
});

function setupSettingsHandlers() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Mock settings save
            showToast('Definições atualizadas com sucesso!', 'success');
        });
    }
}
