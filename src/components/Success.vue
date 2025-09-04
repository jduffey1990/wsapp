<template>
  <div class="success-page">
    <div class="success-container">
      <h3 class="font-weight-regular text-h3">Thank you!</h3>
      <p class="my-3">
        Your recent payment has been successfully processed and your transaction was securely handled through Stripe.  Thank you for being a valued customer.
      </p>

      <h4 class="text-h4">What Happens Next?</h4>
      <ul class="next-steps">
        <li>Feel free to build a bracket from your <strong><a href="/dashboard" target="_blank">Dashboard Page.  </a></strong>.  When you now click on the "Build Me a Bracket!" button, you will be led to the builder.
        </li>
        <li>If you have any questions or need assistance with this transaction, reach out to support
          <a href="mailto:foxdogdevelopment@gmail.com">foxdogdevelopment@gmail.com</a>.
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.success-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: transparent;
  padding: 20px;
}

.success-container {
  text-align: center;
  max-width: 700px;
  background: rgba(255, 255, 255, 0.2);
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.next-steps {
  text-align: left;
  padding-left: 20px;
  margin: 20px 0;
  font-size: 20px;
  font-family: "halyard-text" !important;
  color: var(--Primary-Dark, #07152A);
}

.next-steps li {
  line-height: 130%;
  margin-bottom: 10px;
}
</style>
