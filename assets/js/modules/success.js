// Success Page Module
import { router } from '../core/router.js';
import { ordersAPI } from '../core/api.js';

/**
 * Inicializa a página de sucesso, buscando detalhes do pedido
 */
export const initSuccessPage = async () => {
  const params = router.getQueryParams();
  const orderId = params.order;

  if (!orderId) {
    // Se cair aqui sem um ID, volta pro início
    setTimeout(() => router.navigate('/customer/dashboard.html'), 3000);
    return;
  }

  const container = document.getElementById('success-content');
  if (!container) return;

  // Mostrar estado de carregamento inicial
  container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
            <div class="spinner mb-4 border-primary border-t-transparent animate-spin"></div>
            <p class="text-secondary">Confirmando detalhes do seu pedido...</p>
        </div>
    `;

  try {
    // Opcional: Buscar dados do pedido para mostrar algo mais detalhado
    const result = await ordersAPI.getById(orderId);

    if (result.success) {
      const order = result.data;
      renderSuccessDetails(container, order);
    } else {
      // Se não encontrar o pedido no DB (raro mas possível no sync), mostra genérico
      renderGenericSuccess(container, orderId);
    }
  } catch (error) {
    renderGenericSuccess(container, orderId);
  }
};

const renderSuccessDetails = (container, order) => {
  container.innerHTML = `
        <div class="success-state text-center animate-fade-in">
            <div class="text-6xl mb-6 inline-block bg-success/10 p-6 rounded-full">✅</div>
            <h1 class="text-3xl font-bold mb-2">Pedido Confirmado!</h1>
            <p class="text-secondary mb-8 text-lg">Obrigado por comprar conosco. Seu pedido já está sendo preparado.</p>
            
            <div class="card bg-tertiary p-6 rounded-xl mb-8 text-left max-w-md mx-auto">
                <div class="flex justify-between border-b border-white/10 pb-3 mb-3">
                    <span class="text-secondary">Número do Pedido:</span>
                    <span class="font-bold">#${order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div class="flex justify-between border-b border-white/10 pb-3 mb-3">
                    <span class="text-secondary">Total Pago:</span>
                    <span class="font-bold text-primary">${order.total_amount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-secondary">Método:</span>
                    <span class="font-bold uppercase">${order.payment_method}</span>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="orders.html" class="btn btn-primary px-8 py-3">Acompanhar Pedido</a>
                <a href="dashboard.html" class="btn btn-ghost px-8 py-3">Voltar à Loja</a>
            </div>
        </div>
    `;
};

const renderGenericSuccess = (container, orderId) => {
  container.innerHTML = `
        <div class="success-state text-center">
            <div class="text-6xl mb-6">🎉</div>
            <h1 class="text-3xl font-bold mb-2">Quase Tudo Pronto!</h1>
            <p class="text-secondary mb-8">Seu pedido #${orderId.slice(0, 8).toUpperCase()} foi recebido por nosso sistema.</p>
            <div class="flex gap-4 justify-center">
                <a href="dashboard.html" class="btn btn-primary">Voltar ao Início</a>
            </div>
        </div>
    `;
};

export default { initSuccessPage };
