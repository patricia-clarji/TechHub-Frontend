import { apiClient } from './apiClient';
import config from '@/config';

export const submitOrderRequest = async ({ customer, address, notes, items, total }) => {
  const [firstName, ...lastNameParts] = customer.name.trim().split(/\s+/);
  const lines = items.map((item) => [
    `${item.quantity} × ${item.name}`,
    item.variantName && `Variant: ${item.variantName}`,
    item.color && `Color: ${item.color}`,
    `Unit price: $${item.price.toFixed(2)}`,
    `Product ID: ${item.productId}`,
  ].filter(Boolean).join(' | '));

  const message = [
    'Cash on Delivery / Order Request',
    `Phone: ${customer.phone}`,
    `Address: ${address}`,
    notes ? `Notes: ${notes}` : '',
    '',
    ...lines,
    '',
    `Total: $${total.toFixed(2)}`,
    'No online payment was collected.',
  ].filter(Boolean).join('\n');

  const response = await apiClient.post('/contactmessage/', {
    first_name: firstName,
    last_name: lastNameParts.join(' ') || '-',
    email: customer.email.trim(),
    subject: 'Website order request',
    message,
    store_id: config.API.STORE_ID,
  }, { retries: 0, dedupe: false });

  if (!response.success) throw response.error;
  return response.data;
};
