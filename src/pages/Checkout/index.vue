<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useCartStore } from '@/stores/shop/cart';
import { useProductsStore } from '@/stores/shop/products';
import { useToastStore } from '@/stores/ui/toast';
import { useUserStore } from '@/stores/auth/user';
import { useRouter } from 'vue-router';
import { submitOrderRequest } from '@/services/orderRequestService';

const cartStore = useCartStore();
const productsStore = useProductsStore();
const toastStore = useToastStore();
const userStore = useUserStore();
const router = useRouter();
const submitting = ref(false);
const attempted = ref(false);
const form = reactive({ name: '', email: '', phone: '', address: '', city: '', postalCode: '', notes: '' });
const prefilledFor = ref('');
const firstName = computed({
  get: () => form.name.trim().split(/\s+/)[0] || '',
  set: (value) => {
    form.name = [value, lastName.value].filter(Boolean).join(' ');
  },
});
const lastName = computed({
  get: () => form.name.trim().split(/\s+/).slice(1).join(' '),
  set: (value) => {
    form.name = [firstName.value, value].filter(Boolean).join(' ');
  },
});

const errors = computed(() => ({
  name: form.name.trim().length >= 2 ? '' : 'Enter your full name.',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Enter a valid email address.',
  phone: /^\+?[0-9\s()-]{7,20}$/.test(form.phone.trim()) ? '' : 'Enter a valid phone number.',
  address: form.address.trim().length >= 10 ? '' : 'Enter a complete delivery address.',
  city: form.city.trim().length >= 2 ? '' : 'Enter your city or delivery area.',
}));
const valid = computed(() => Object.values(errors.value).every((value) => !value));
const checkoutUserKey = computed(() => {
  const user = userStore.currentUser;
  return user ? String(user.id || user.email || '') : '';
});

const resetPrivateCheckoutFields = () => {
  form.name = '';
  form.email = '';
  form.phone = '';
  form.address = '';
  form.city = '';
  form.postalCode = '';
  prefilledFor.value = '';
};

const applyCustomerPrefill = () => {
  const user = userStore.currentUser;
  const key = checkoutUserKey.value;
  if (!user || !key || prefilledFor.value === key) return;
  const address = user.defaultAddress || null;

  if (!form.name.trim()) form.name = user.displayName || user.name || [user.firstName, user.lastName].filter(Boolean).join(' ');
  if (!form.email.trim()) form.email = user.email || '';
  if (!form.phone.trim()) form.phone = user.phone || '';
  if (address) {
    if (!form.address.trim()) form.address = address.address || '';
    if (!form.city.trim()) form.city = address.city || address.region || '';
    if (!form.postalCode.trim()) form.postalCode = address.postalCode || '';
    if (!form.notes.trim()) form.notes = address.notes || '';
  }

  prefilledFor.value = key;
};

onMounted(async () => {
  await productsStore.fetchProducts();
  if (!cartStore.items.length) router.replace('/cart');
  await userStore.restoreSession();
  applyCustomerPrefill();
});

watch(checkoutUserKey, (next, previous) => {
  if (!next) {
    resetPrivateCheckoutFields();
    return;
  }
  if (previous && previous !== next) resetPrivateCheckoutFields();
  applyCustomerPrefill();
});

const submit = async () => {
  attempted.value = true;
  if (!cartStore.items.length || cartStore.hasUnavailableItems) {
    toastStore.showToast('Review unavailable or out-of-stock cart items before checkout.', 'fa-triangle-exclamation');
    return;
  }
  if (!valid.value) return;

  submitting.value = true;
  try {
    const response = await submitOrderRequest({
      customer: form,
      address: form.address.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
      notes: form.notes.trim(),
      items: cartStore.detailedItems,
      total: cartStore.totalAmount,
    });
    const reference = response?.id || response?.reference || `REQ-${Date.now().toString(36).toUpperCase()}`;
    cartStore.clearCart();
    router.replace({ name: 'OrderConfirmation', query: { request: reference } });
  } catch {
    toastStore.showToast('We could not submit your request. Please try again or contact TechHub.', 'fa-triangle-exclamation');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <main class="checkout-page">
    <div class="checkout-shell">
      <div class="checkout-heading">
        <span>TechHub Checkout</span>
        <h1>Submit an Order Request</h1>
        <p>Review your items, share delivery details, and request cash-on-delivery confirmation.</p>
      </div>

      <form class="checkout-grid" @submit.prevent="submit" novalidate>
        <div class="checkout-column checkout-column--review">
          <section class="checkout-card review-card" aria-labelledby="checkout-review-title">
            <div class="checkout-card-head">
              <h2 id="checkout-review-title" class="checkout-section-title">1. Review Your Order</h2>
              <span>{{ cartStore.itemCount }} item{{ cartStore.itemCount === 1 ? '' : 's' }}</span>
            </div>

            <div class="checkout-items">
              <article v-for="item in cartStore.detailedItems" :key="item.lineKey" class="checkout-item">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="checkout-item-image" />
                <div v-else class="checkout-item-image checkout-item-image--empty" aria-hidden="true"></div>

                <div class="checkout-item-main">
                  <p class="checkout-item-name">{{ item.name }}</p>
                  <p v-if="item.variantName || item.color" class="checkout-item-meta">{{ [item.variantName, item.color].filter(Boolean).join(' · ') }}</p>
                  <p class="checkout-item-price">$ {{ item.price.toFixed(2) }}</p>

                  <div class="checkout-item-footer">
                    <div class="checkout-qty" :aria-label="`Quantity for ${item.name}`">
                      <button type="button" @click="cartStore.increment(item.lineKey, -1)" :disabled="item.quantity <= 1 || item.unavailable" :aria-label="`Decrease ${item.name} quantity`">−</button>
                      <span>{{ item.quantity }}</span>
                      <button type="button" @click="cartStore.increment(item.lineKey, 1)" :disabled="item.quantity >= item.stock || item.unavailable" :aria-label="`Increase ${item.name} quantity`">+</button>
                    </div>
                    <button type="button" class="checkout-remove" @click="cartStore.removeFromCart(item.lineKey)" :aria-label="`Remove ${item.name} from cart`">Remove</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div class="checkout-column checkout-column--details">
          <section class="checkout-card checkout-form-card" aria-labelledby="checkout-contact-title">
            <h2 id="checkout-contact-title" class="checkout-section-title">2. Contact Information</h2>
            <div class="checkout-notice">Already have an account? Sign in from the account menu.</div>

            <div class="checkout-name-row">
              <label class="checkout-field" for="checkout-first-name">
                <span>First Name</span>
                <input id="checkout-first-name" v-model="firstName" type="text" autocomplete="given-name" :aria-invalid="attempted && Boolean(errors.name)" aria-describedby="checkout-name-error" />
              </label>
              <label class="checkout-field" for="checkout-last-name">
                <span>Last Name</span>
                <input id="checkout-last-name" v-model="lastName" type="text" autocomplete="family-name" :aria-invalid="attempted && Boolean(errors.name)" aria-describedby="checkout-name-error" />
              </label>
            </div>
            <p v-if="attempted && errors.name" id="checkout-name-error" class="checkout-error">{{ errors.name }}</p>

            <label class="checkout-field" for="email">
              <span>Email</span>
              <input id="email" v-model="form.email" type="email" autocomplete="email" :aria-invalid="attempted && Boolean(errors.email)" aria-describedby="checkout-email-error" />
            </label>
            <p v-if="attempted && errors.email" id="checkout-email-error" class="checkout-error">{{ errors.email }}</p>

            <div class="checkout-phone-row">
              <label class="checkout-field checkout-code" for="checkout-country-code">
                <span>Country code</span>
                <select id="checkout-country-code" aria-label="Country code">
                  <option>🇱🇧 +961</option>
                </select>
              </label>
              <label class="checkout-field" for="phone">
                <span>Phone number</span>
                <input id="phone" v-model="form.phone" type="tel" autocomplete="tel" :aria-invalid="attempted && Boolean(errors.phone)" aria-describedby="checkout-phone-error" />
              </label>
            </div>
            <p v-if="attempted && errors.phone" id="checkout-phone-error" class="checkout-error">{{ errors.phone }}</p>
          </section>

          <section class="checkout-card checkout-form-card" aria-labelledby="checkout-address-title">
            <h2 id="checkout-address-title" class="checkout-section-title">3. Delivery Address</h2>
            <div class="checkout-notice">Already have an address? Sign in from the account menu.</div>

            <label class="checkout-field" for="checkout-country">
              <span>Country</span>
              <select id="checkout-country" aria-label="Delivery country">
                <option>Lebanon</option>
              </select>
            </label>
            <label class="checkout-field" for="address">
              <span>Address</span>
              <textarea id="address" v-model="form.address" autocomplete="street-address" rows="4" :aria-invalid="attempted && Boolean(errors.address)" aria-describedby="checkout-address-error"></textarea>
            </label>
            <p v-if="attempted && errors.address" id="checkout-address-error" class="checkout-error">{{ errors.address }}</p>
            <div class="checkout-address-row">
              <label class="checkout-field" for="checkout-city">
                <span>City / Area</span>
                <input id="checkout-city" v-model="form.city" type="text" autocomplete="address-level2" :aria-invalid="attempted && Boolean(errors.city)" aria-describedby="checkout-city-error" />
              </label>
              <label class="checkout-field" for="checkout-postal-code">
                <span>Postal / ZIP <em>(optional)</em></span>
                <input id="checkout-postal-code" v-model="form.postalCode" type="text" autocomplete="postal-code" />
              </label>
            </div>
            <p v-if="attempted && errors.city" id="checkout-city-error" class="checkout-error">{{ errors.city }}</p>
            <label class="checkout-field" for="notes">
              <span>Delivery notes <em>(optional)</em></span>
              <textarea id="notes" v-model="form.notes" maxlength="1000" rows="3" placeholder="Building, floor, nearby landmark, or delivery instructions"></textarea>
            </label>
          </section>
        </div>

        <aside class="checkout-column checkout-side">
          <section class="checkout-card" aria-labelledby="checkout-payment-title">
            <fieldset class="checkout-payment">
              <legend id="checkout-payment-title" class="checkout-section-title">4. Select Payment Method</legend>
              <label class="payment-row">
                <input type="radio" checked name="payment-method" value="cod" readonly />
                <span class="payment-icon" aria-hidden="true">COD</span>
                <span class="payment-label">
                  <strong>Cash on Delivery</strong>
                  <small>Confirmed by the TechHub team</small>
                </span>
                <span class="payment-radio" aria-hidden="true"></span>
              </label>
            </fieldset>
          </section>

          <section class="checkout-card checkout-summary" aria-labelledby="checkout-summary-title">
            <h2 id="checkout-summary-title" class="checkout-section-title">Order Summary</h2>
            <div v-for="item in cartStore.detailedItems" :key="`summary-${item.lineKey}`" class="summary-line">
              <span>{{ item.quantity }} × {{ item.name }}</span>
              <strong>$ {{ (item.price * item.quantity).toFixed(2) }}</strong>
            </div>
            <div class="summary-line">
              <span>Subtotal</span>
              <strong>$ {{ cartStore.subtotal.toFixed(2) }}</strong>
            </div>
            <div v-if="cartStore.discountTotal > 0" class="summary-line summary-line--discount">
              <span>Discount</span>
              <strong>− $ {{ cartStore.discountTotal.toFixed(2) }}</strong>
            </div>
            <div class="summary-total">
              <span>Order Total</span>
              <strong>$ {{ cartStore.totalAmount.toFixed(2) }}</strong>
            </div>
            <button type="submit" :disabled="submitting || !cartStore.items.length" class="checkout-submit">
              {{ submitting ? 'Submitting…' : 'Submit Order Request' }}
            </button>
            <p class="checkout-privacy">By submitting this request, you consent to TechHub contacting you to confirm stock, delivery, and cash-on-delivery terms.</p>
          </section>
        </aside>
      </form>
    </div>
  </main>
</template>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #f6f4f1;
  padding: 8.25rem 1.25rem 5rem;
}

.checkout-shell {
  width: min(100%, 1680px);
  margin: 0 auto;
}

.checkout-heading {
  margin-bottom: 1.6rem;
}

.checkout-heading span {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.checkout-heading h1 {
  font-family: Playfair Display, serif;
  font-size: clamp(2rem, 3vw, 3.25rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0;
}

.checkout-heading p {
  margin-top: 0.55rem;
  color: var(--text-muted);
  font-size: 0.98rem;
}

.checkout-grid {
  display: grid;
  grid-template-columns: minmax(300px, 0.94fr) minmax(340px, 1fr) minmax(320px, 0.98fr);
  gap: clamp(1rem, 1.7vw, 1.75rem);
  align-items: start;
}

.checkout-column {
  display: grid;
  gap: 1.15rem;
  min-width: 0;
}

.checkout-card {
  background: #fff;
  border: 1px solid #ded8d2;
  border-radius: 0.45rem;
  box-shadow: 0 16px 34px rgba(45, 34, 27, 0.055);
  padding: clamp(1.15rem, 1.55vw, 1.55rem);
}

.checkout-card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid #e7e1dc;
  padding-bottom: 0.9rem;
}

.checkout-card-head span {
  flex: 0 0 auto;
  color: var(--text-muted);
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
}

.checkout-section-title {
  display: block;
  margin: 0 0 1rem;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 900;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.checkout-card-head .checkout-section-title {
  margin: 0;
}

.checkout-items {
  display: grid;
}

.checkout-item {
  display: grid;
  grid-template-columns: 5.6rem minmax(0, 1fr);
  gap: 0.95rem;
  align-items: start;
  border-bottom: 1px solid #e9e3de;
  padding: 1.15rem 0;
}

.checkout-item:last-child {
  border-bottom: 0;
  padding-bottom: 0.15rem;
}

.checkout-item-image {
  width: 5.6rem;
  height: 6.65rem;
  border: 1px solid #ece6e1;
  border-radius: 0.25rem;
  object-fit: cover;
  background: #f2efeb;
}

.checkout-item-image--empty {
  display: block;
}

.checkout-item-name {
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.35;
}

.checkout-item-meta,
.checkout-item-price {
  margin-top: 0.35rem;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.checkout-item-price {
  color: var(--text);
  font-weight: 800;
}

.checkout-item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.checkout-qty {
  display: inline-grid;
  grid-template-columns: 2rem 2.15rem 2rem;
  align-items: center;
  border: 1px solid #d8d0ca;
  background: #fff;
}

.checkout-qty button {
  width: 2rem;
  height: 2rem;
  background: #f7f4f1;
  color: var(--text);
  font-size: 1.15rem;
  line-height: 1;
  transition: background 0.2s ease, color 0.2s ease, opacity 0.2s ease;
}

.checkout-qty button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.checkout-qty button:not(:disabled):hover {
  background: #351c14;
  color: #fff;
}

.checkout-qty span {
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 2rem;
}

.checkout-remove {
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.checkout-remove:hover,
.checkout-remove:focus-visible {
  color: #b42318;
}

.checkout-form-card {
  display: block;
}

.checkout-notice {
  margin-bottom: 1rem;
  background: #138a47;
  color: #fff;
  border-radius: 0.2rem;
  padding: 0.78rem 0.9rem;
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.35;
}

.checkout-name-row,
.checkout-phone-row,
.checkout-address-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.checkout-phone-row {
  grid-template-columns: 8.5rem 1fr;
}

.checkout-field {
  display: block;
  margin-bottom: 0.9rem;
}

.checkout-field span {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--text-muted);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
}

.checkout-field em {
  color: var(--text-muted);
  font-style: normal;
  font-weight: 500;
  text-transform: none;
}

.checkout-field input,
.checkout-field select,
.checkout-field textarea {
  width: 100%;
  min-height: 3rem;
  border: 1px solid #d8d1cb;
  border-radius: 0;
  background: #fff;
  color: var(--text);
  padding: 0.78rem 0.82rem;
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.checkout-field textarea {
  min-height: 5.4rem;
  resize: vertical;
}

.checkout-field input:focus,
.checkout-field select:focus,
.checkout-field textarea:focus,
.payment-row:focus-within,
.checkout-submit:focus-visible,
.checkout-qty button:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
}

.checkout-field [aria-invalid="true"] {
  border-color: #dc2626;
}

.checkout-error {
  margin: -0.45rem 0 0.75rem;
  color: #dc2626;
  font-size: 0.78rem;
  font-weight: 600;
}

.checkout-side {
  position: sticky;
  top: 6.75rem;
}

.checkout-payment {
  margin: 0;
  border: 0;
  padding: 0;
}

.payment-row {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
  min-height: 4.25rem;
  border: 1px solid #d8d1cb;
  background: #fbfaf8;
  padding: 0.9rem;
  cursor: default;
}

.payment-row input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.payment-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  background: #351c14;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 900;
}

.payment-label {
  display: grid;
  gap: 0.15rem;
}

.payment-label strong {
  color: var(--text);
  font-size: 0.9rem;
}

.payment-label small {
  color: var(--text-muted);
  font-size: 0.76rem;
}

.payment-radio {
  width: 1.1rem;
  height: 1.1rem;
  border: 1px solid #d1cbc7;
  border-radius: 999px;
}

.payment-row input:checked ~ .payment-radio {
  border-color: #351c14;
  box-shadow: inset 0 0 0 4px #fff;
  background: #351c14;
}

.checkout-summary {
  padding-bottom: 1.35rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid #eee8e3;
  padding: 0.68rem 0;
  color: var(--text);
  font-size: 0.88rem;
}

.summary-line strong {
  flex: 0 0 auto;
  white-space: nowrap;
}

.summary-line--discount {
  color: #15803d;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 1rem calc(-1 * clamp(1.15rem, 1.55vw, 1.55rem)) 1.25rem;
  background: #351c14;
  color: #fff;
  padding: 1rem clamp(1.15rem, 1.55vw, 1.55rem);
  font-weight: 900;
  text-transform: uppercase;
}

.checkout-submit {
  width: 100%;
  min-height: 3.1rem;
  background: #351c14;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.01em;
  transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.checkout-submit:not(:disabled):hover {
  background: var(--accent);
  transform: translateY(-1px);
}

.checkout-submit:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.checkout-privacy {
  margin-top: 0.75rem;
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.55;
}

@media (max-width: 1180px) and (min-width: 821px) {
  .checkout-grid {
    grid-template-columns: minmax(0, 1fr) minmax(310px, 0.86fr);
  }

  .checkout-column--review,
  .checkout-column--details {
    grid-column: 1 / 2;
  }

  .checkout-side {
    grid-column: 2 / 3;
    grid-row: 1 / span 2;
  }
}

@media (max-width: 820px) {
  .checkout-page {
    padding: 7rem 1rem 4rem;
  }

  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .checkout-form-card,
  .checkout-side {
    grid-column: auto;
    grid-row: auto;
    position: static;
  }

  .checkout-heading {
    margin-bottom: 1.2rem;
  }
}

@media (max-width: 560px) {
  .checkout-page {
    padding-inline: 0.85rem;
  }

  .checkout-item {
    grid-template-columns: 4.65rem minmax(0, 1fr);
    gap: 0.75rem;
  }

  .checkout-item-image {
    width: 4.65rem;
    height: 5.65rem;
  }

  .checkout-item-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.65rem;
  }

  .checkout-name-row,
  .checkout-phone-row,
  .checkout-address-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .checkout-card {
    padding: 1rem;
  }

  .checkout-card-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.35rem;
  }
}
</style>
