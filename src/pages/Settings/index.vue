<script setup>
import { useUserStore } from '@/stores/user'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userStore = useUserStore()

const activeTab = ref('profile')

const profile = ref({
  name: userStore.currentUser?.name || '',
  email: userStore.currentUser?.email || '',
  phone: userStore.currentUser?.phone || ''
})

const passwords = ref({
  current: '',
  new: '',
  confirm: ''
})

const passwordErrors = ref({
  current: '',
  new: '',
  confirm: ''
})

const billing = ref({
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  address: ''
})

const billingErrors = ref({
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  address: ''
})

const notifications = ref(
    userStore.currentUser?.notifications || {
    orders: true,
    promotions: false,
    alerts: true
  }
)

const profilePreview = computed(() => {
  return userStore.currentUser?.avatar
})

function saveNotifications() {
  userStore.updateProfile({
    notifications: notifications.value
  })

}

function saveProfile() {
  userStore.updateProfile({
    name: profile.value.name,
    email: profile.value.email,
    phone: profile.value.phone,
    avatar: userStore.currentUser.avatar,
    notifications: notifications.value
  })
}

function handleImageUpload(event) {
  const file = event.target.files[0]

  if (!file) return

  const reader = new FileReader()

  reader.onload = () => {
    userStore.updateProfile({
      avatar: reader.result
    })
  }

  reader.readAsDataURL(file)
}

function removeProfilePicture() {
    userStore.updateProfile({
        avatar: null
    })
}

function saveBilling() {

    billingErrors.value = {
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        address: ''
    }

    let valid = true

    if (!billing.value.cardName.trim()) {
        billingErrors.value.cardName =
        'Card holder name is required'
        valid = false
    }

    const cardNumber =
        billing.value.cardNumber.replace(/\s/g, '')

    if (!cardNumber) {
        billingErrors.value.cardNumber =
        'Card number is required'
        valid = false
    }
    else if (!/^\d+$/.test(cardNumber)) {
        billingErrors.value.cardNumber =
        'Card number must contain only digits'
        valid = false
    }
    else if (cardNumber.length !== 16) {
        billingErrors.value.cardNumber =
        'Card number must be 16 digits'
        valid = false
    }

    if (
        !/^(0[1-9]|1[0-2])\/\d{2}$/
        .test(billing.value.expiry)
    ) {
        billingErrors.value.expiry =
        'Use MM/YY format'
        valid = false
    }

    if (
        !/^\d{3,4}$/
        .test(billing.value.cvv)
    ) {
        billingErrors.value.cvv =
        'CVV must be 3 or 4 digits'
        valid = false
    }

    if (!billing.value.address.trim()) {
        billingErrors.value.address =
        'Billing address is required'
        valid = false
    }

    if (!valid) return

}

function updatePassword() {

    passwordErrors.value = {
        current: '',
        new: '',
        confirm: ''
    }

    let valid = true

    if (!passwords.value.current.trim()) {
        passwordErrors.value.current =
        'Current password is required'
        valid = false
    }

    if (!passwords.value.new.trim()) {
        passwordErrors.value.new =
        'New password is required'
        valid = false
    }
    else if (passwords.value.new.length < 8) {
        passwordErrors.value.new =
        'Password must be at least 8 characters'
        valid = false
    }

    if (!passwords.value.confirm.trim()) {
        passwordErrors.value.confirm =
        'Please confirm your password'
        valid = false
    }

    if (
        passwords.value.current &&
        passwords.value.new &&
        passwords.value.current === passwords.value.new
    ) {
        passwordErrors.value.new =
        'New password must be different'
        valid = false
    }

    if (
        passwords.value.new &&
        passwords.value.confirm &&
        passwords.value.new !== passwords.value.confirm
    ) {
        passwordErrors.value.confirm =
        'Passwords do not match'
        valid = false
    }

    if (!valid) return

    alert('Password updated successfully!')

    passwords.value = {
        current: '',
        new: '',
        confirm: ''
    }
}
</script>

<template>
  <main class="pt-32 pb-20 max-w-7xl mx-auto px-6">

    <!-- Header -->

    <div class="text-center mb-12">
      <span class="section-badge">
        ACCOUNT CENTER
      </span>

      <h1 class="font-[Playfair_Display] text-5xl font-extrabold mt-4">
        Settings
      </h1>

      <p class="text-sm text-[var(--text-muted)] mt-4 max-w-xl mx-auto">
        Manage your account information, security settings,
        billing details and notification preferences.
      </p>
    </div>

    <!-- Profile Summary Card -->

    <div
      class="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-8 mb-8">

      <div class="flex items-center gap-6">

        <div
            class="
            w-32
            h-32
            rounded-full
            overflow-hidden
            bg-[var(--accent)]
            flex
            items-center
            justify-center">

            <img
                v-if="profilePreview"
                :src="profilePreview"
                alt="Profile"
                class="w-full h-full object-cover"
            >
            <span
                v-else
                class="text-white text-5xl font-bold uppercase">

                {{ profile.name?.charAt(0) || 'U' }}

            </span>
        </div>

        <div>
            <h2 class="text-2xl font-bold">
            {{ profile.name }}
            </h2>

            <p class="text-[var(--text-muted)]">
            {{ profile.email }}
            </p>
        </div>

        </div>
    </div>

    <!-- Main Layout -->

    <div class="flex flex-col lg:flex-row gap-8">

      <!-- Sidebar -->

      <aside
        class="lg:w-72 shrink-0 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-6">

        <h3 class="font-bold mb-6">
          Settings
        </h3>

        <div class="space-y-3">

          <button
            @click="activeTab = 'profile'"
            class="cursor-pointer w-full text-left px-4 py-3 rounded-xl transition"
            :class="activeTab === 'profile'
              ? 'bg-[var(--accent)] text-white'
              : 'hover:bg-[var(--bg-muted)]'"
          >
            Profile
          </button>

          <button
            @click="activeTab = 'security'"
            class="cursor-pointer w-full text-left px-4 py-3 rounded-xl transition"
            :class="activeTab === 'security'
              ? 'bg-[var(--accent)] text-white'
              : 'hover:bg-[var(--bg-muted)]'"
          >
            Security
          </button>

          <button
            @click="activeTab = 'billing'"
            class="cursor-pointer w-full text-left px-4 py-3 rounded-xl transition"
            :class="activeTab === 'billing'
              ? 'bg-[var(--accent)] text-white'
              : 'hover:bg-[var(--bg-muted)]'"
          >
            Billing
          </button>

          <button
            @click="activeTab = 'notifications'"
            class="cursor-pointer w-full text-left px-4 py-3 rounded-xl transition"
            :class="activeTab === 'notifications'
              ? 'bg-[var(--accent)] text-white'
              : 'hover:bg-[var(--bg-muted)]'"
          >
            Notifications
          </button>

        </div>

      </aside>

      <!-- Content -->

      <section
        class="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-8">

        <!-- Profile -->

        <div v-if="activeTab === 'profile'">

        <h2 class="font-[Playfair_Display] text-4xl font-bold mb-2">
            Profile Settings
        </h2>

        <p class="text-[var(--text-muted)] mb-8">
            Update your personal information.
        </p>

        <div class="flex flex-col lg:flex-row gap-10">

            <!-- Profile Panel -->

            <div
            class="w-full lg:w-64 flex flex-col items-center justify-center text-center shrink-0">

                <div
                    class="
                    w-32
                    h-32
                    rounded-full
                    overflow-hidden
                    bg-[var(--accent)]
                    flex
                    items-center
                    justify-center">

                    <img
                        v-if="profilePreview"
                        :src="profilePreview"
                        alt="Profile"
                        class="w-full h-full object-cover"
                    >
                    <span
                        v-else
                        class="text-white text-5xl font-bold uppercase">

                        {{ profile.name?.charAt(0) || 'U' }}

                    </span>
                </div>

                <label
                    class="
                    mt-5
                    cursor-pointer
                    px-5
                    py-3
                    rounded-xl
                    border
                    border-[var(--accent)]
                    text-[var(--accent)]
                    font-medium
                    hover:bg-[var(--accent)]
                    hover:text-white
                    transition">

                    Change Picture

                    <input
                    type="file"
                    class="hidden"
                    @change="handleImageUpload"
                    >
                </label>

                <button
                    @click="removeProfilePicture"
                    class="
                    mt-5
                    cursor-pointer
                    px-5
                    py-3
                    rounded-xl
                    border
                    border-red-500
                    text-red-500
                    font-medium
                    hover:bg-[var(--accent)]
                    hover:text-white
                    transition"
                >
                    Remove Picture

                </button>

            </div>

            <!-- Divider -->

            <div
            class="hidden lg:block w-px bg-[var(--border)]">
            </div>

            <!-- Form -->

            <div class="flex-1 pt-4">

            <div class="space-y-6">

                <div>
                <label class="block mb-2 font-medium">
                    Full Name
                </label>

                <input
                    v-model="profile.name"
                    type="text"
                    class="
                    w-full
                    border
                    border-[var(--border)]
                    rounded-xl
                    px-4
                    py-3
                    bg-transparent
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[var(--accent)]"
                >
                </div>

                <div>
                <label class="block mb-2 font-medium">
                    Email Address
                </label>

                <input
                    v-model="profile.email"
                    type="email"
                    class="
                    w-full
                    border
                    border-[var(--border)]
                    rounded-xl
                    px-4
                    py-3
                    bg-transparent
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[var(--accent)]"
                >
                </div>

                <div>
                <label class="block mb-2 font-medium">
                    Phone Number
                </label>

                <input
                    v-model="profile.phone"
                    type="text"
                    class="
                    w-full
                    border
                    border-[var(--border)]
                    rounded-xl
                    px-4
                    py-3
                    bg-transparent
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[var(--accent)]"
                >
                </div>

                <div class="pt-2">

                <button
                    @click="saveProfile"
                    class="
                    cursor-pointer
                    bg-[var(--accent)]
                    text-white
                    px-6
                    py-3
                    rounded-xl
                    font-medium
                    hover:opacity-90
                    transition">

                    Save Changes

                </button>

                </div>

            </div>

            </div>

        </div>

        </div>

        <!-- Security -->

        <div v-if="activeTab === 'security'">

          <h2 class="font-[Playfair_Display] text-4xl font-bold mb-2">
            Security Settings
          </h2>

          <p class="text-[var(--text-muted)] mb-8">
            Update your password and account security.
          </p>

          <div class="space-y-6">

            <div>
                <label class="block mb-2 font-medium">
                    Current Password
                </label>

                <input
                    v-model="passwords.current"
                    type="password"
                    class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-transparent"
                    placeholder="Enter Your Current Password"
                >

                <p
                    v-if="passwordErrors.current"
                    class="text-red-500 text-sm mt-1">

                    {{ passwordErrors.current }}

                </p>
            </div>

            <div>
                <label class="block mb-2 font-medium">
                    New Password
                </label>

                <input
                    v-model="passwords.new"
                    type="password"
                    class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-transparent"
                    placeholder="Enter Your New Password"
                >

                <p
                    v-if="passwordErrors.new"
                    class="text-red-500 text-sm mt-1">

                    {{ passwordErrors.new }}

                </p>
            </div>

            <div>
                <label class="block mb-2 font-medium">
                    Confirm Password
                </label>

                <input
                    v-model="passwords.confirm"
                    type="password"
                    class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-transparent"
                    placeholder="Enter Your New Password Again"
                >

                <p
                    v-if="passwordErrors.confirm"
                    class="text-red-500 text-sm mt-1">

                    {{ passwordErrors.confirm }}

                </p>
            </div>

            <button
            @click="updatePassword"
            class="
            bg-[var(--accent)]
            text-white
            px-6
            py-3
            rounded-xl
            font-medium
            hover:opacity-90
            transition
            cursor-pointer"
            >
                Update Password
            </button>

          </div>

        </div>

        <!-- Billing -->

        <div v-if="activeTab === 'billing'">

            <h2 class="font-[Playfair_Display] text-4xl font-bold mb-2">
                Billing Details
            </h2>

            <p class="text-[var(--text-muted)] mb-8">
                Manage your billing information.
            </p>

            <div class="space-y-5">

                <div>
                    <label class="block mb-2 font-medium">
                        Card Holder Name
                    </label>

                    <input
                        v-model="billing.cardName"
                        type="text"
                        class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-transparent"
                        placeholder="Enter Your Credit Card Name"
                    >

                    <p
                        v-if="billingErrors.cardName"
                        class="text-red-500 text-sm mt-1">

                        {{ billingErrors.cardName }}

                    </p>
                </div>

                <div>
                    <label class="block mb-2 font-medium">
                        Card Number
                    </label>

                    <input
                        v-model="billing.cardNumber"
                        type="text"
                        class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-transparent"
                        placeholder="1234123412341234"
                    >

                    <p
                        v-if="billingErrors.cardNumber"
                        class="text-red-500 text-sm mt-1">

                        {{ billingErrors.cardNumber }}

                    </p>
                </div>

                <div class="grid grid-cols-2 gap-4">

                    <div>
                        <label class="block mb-2 font-medium">
                        Expiry Date
                        </label>

                        <input
                        v-model="billing.expiry"
                        type="text"
                        placeholder="MM/YY"
                        class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-transparent"
                        >

                        <p
                        v-if="billingErrors.expiry"
                        class="text-red-500 text-sm mt-1">

                        {{ billingErrors.expiry }}

                        </p>
                    </div>

                    <div>
                        <label class="block mb-2 font-medium">
                        CVV
                        </label>

                        <input
                        v-model="billing.cvv"
                        type="text"
                        placeholder="123"
                        class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-transparent"
                        >

                        <p
                        v-if="billingErrors.cvv"
                        class="text-red-500 text-sm mt-1">

                        {{ billingErrors.cvv }}

                        </p>
                    </div>

                </div>

                <div>
                    <label class="block mb-2 font-medium">
                        Billing Address
                    </label>

                    <textarea
                        v-model="billing.address"
                        rows="4"
                        class="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-transparent"
                        placeholder="Enter your billing address">
                    </textarea>

                    <p
                        v-if="billingErrors.address"
                        class="text-red-500 text-sm mt-1">

                        {{ billingErrors.address }}

                    </p>
                    </div>

                    <button
                        @click="saveBilling"
                        class="
                        cursor-pointer
                        bg-[var(--accent)]
                        text-white
                        px-6
                        py-3
                        rounded-xl
                        hover:opacity-90
                        transition">

                        Save Billing Info

                    </button>

            </div>
        </div>

        <!-- Notifications -->

        <div v-if="activeTab === 'notifications'">

            <h2 class="font-[Playfair_Display] text-4xl font-bold mb-2">
                Notifications
            </h2>

            <p class="text-[var(--text-muted)] mb-8">
                Choose how you want to be notified.
            </p>

            <div class="space-y-8">

            <div class="flex items-center justify-between">
                <span>Order Updates</span>

                <button
                @click="notifications.orders = !notifications.orders; saveNotifications()"
                class="relative w-14 h-8 rounded-full cursor-pointer transition-colors duration-300"
                :class="notifications.orders ? 'bg-[var(--accent)]' : 'bg-gray-300'">

                <span
                    class="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300"
                    :class="notifications.orders ? 'translate-x-6' : ''">
                </span>

                </button>
            </div>

            <div class="flex items-center justify-between">
                <span>Promotional Offers</span>

                <button
                @click="notifications.promotions = !notifications.promotions; saveNotifications()"
                class="relative w-14 h-8 rounded-full cursor-pointer transition-colors duration-300"
                :class="notifications.promotions ? 'bg-[var(--accent)]' : 'bg-gray-300'">

                <span
                    class="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300"
                    :class="notifications.promotions ? 'translate-x-6' : ''">
                </span>

                </button>
            </div>

            <div class="flex items-center justify-between">
                <span>Security Alerts</span>

                <button
                @click="notifications.alerts = !notifications.alerts; saveNotifications()"
                class="relative w-14 h-8 rounded-full cursor-pointer transition-colors duration-300"
                :class="notifications.alerts ? 'bg-[var(--accent)]' : 'bg-gray-300'">

                <span
                    class="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300"
                    :class="notifications.alerts ? 'translate-x-6' : ''">
                </span>

                </button>
            </div>

            <button
                class="
                cursor-pointer
                bg-[var(--accent)]
                text-white
                px-6
                py-3
                rounded-xl
                hover:opacity-90
                transition">
                Save Preferences
            </button>

            </div>

        </div>
        

      </section>

    </div>

  </main>
</template>