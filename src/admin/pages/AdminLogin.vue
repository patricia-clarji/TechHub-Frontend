<template>
  <main class="admin-login">
    <section class="admin-login-panel">
      <RouterLink to="/" class="storefront-link compact"><i class="fa-solid fa-arrow-left"></i> Storefront</RouterLink>
      <p class="admin-eyebrow">TechHub admin</p>
      <h1>Staff access required</h1>
      <p>The admin workspace is disabled until Osimart provides a server-verified staff authentication contract.</p>

      <div class="admin-login-form">
        <div class="admin-notice warning login-alert" role="alert">
          <i class="fa-solid fa-lock"></i>
          <div>
            <strong>Admin login unavailable</strong>
            <p>Customer accounts cannot access admin routes. Configure a backend staff login, RBAC, MFA, and audit logging before enabling this workspace.</p>
          </div>
        </div>

        <label class="admin-field" for="admin-email">
          <span>Email</span>
          <input
            id="admin-email"
            autocomplete="email"
            disabled
            inputmode="email"
            type="email"
          >
        </label>

        <label class="admin-field" for="admin-password">
          <span>Password</span>
          <input
            id="admin-password"
            autocomplete="current-password"
            disabled
            type="password"
          >
        </label>

        <button class="admin-btn" type="button" disabled>
          <i class="fa-solid fa-lock"></i>
          Staff backend required
        </button>
      </div>
    </section>
  </main>
</template>
