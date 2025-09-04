<template>
    <div class="success-page">
      <div class="success-container">
        <h4 class="mb-4">Payment Information</h4>
        <p>By paying here, you will buy yourself 4 bracket credits.</p>
  
        <form
            id="payment-form"
            @submit.prevent="handleSubmit"
        >
          <div id="link-authentication-element"/>
          <div id="payment-element"/>
          <div>
            <button
                id="submit"
                class="intent-button mt-4"
                :disabled="isPaymentButtonDisabled || isLoading"
            >
              Pay $0.99
            </button>
            <sr-messages :messages="messages" class="small"/>
          </div>
        </form>
      </div>
    </div>
  </template>
  <script setup>
  import {loadStripe} from '@stripe/stripe-js';
  import {inject, onMounted, ref} from 'vue';
  import {useUserStore} from '@/store/user';
  import {storeToRefs} from "pinia";
  import SrMessages from "@/components/SrMessages.vue";
  
  const stripePublicKey = import.meta.env.VITE_STRIPE_PUB_KEY

  const $users = inject('$usersApi');
  
  const isPaymentButtonDisabled = ref(false);
  const isLoading = ref(false)
  const stateClient = ref({});
  let stripe;
  let elements;
  const messages = ref([]);
  
  const appearance = {
    theme: 'stripe',
    variables: {
      borderRadius: '6px',
    },
    rules: {
      '.Input': {
        boxShadow: 'inset 0 0 0 1px #07152A',
        padding: '0.75em 1em',
        color: '#FF6801',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
      },
      '.Input:focus': {
        boxShadow: 'inset 0 0 0 2px #FF6801',
      },
      '.Input:hover': {
        boxShadow: 'inset 0 0 0 1px #FF6801',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
      },
      '.Button': {
        alignItems: 'center'
      },
      '.Tab': {
        padding: '10px 20px',
        margin: '15px 5px',
        border: '4px',
        borderRadius: '50px',
        borderColor: '#07152A',
        fontWeight: '500',
        fontSize: '16px',
        textTransform: 'uppercase',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        fontFamily: '"halyard-text" !important',
      },
      '.Tab:hover': {
        backgroundColor: '#FF6801',
        color: '#fff',
      },
      '.Tab--selected': {
        boxShadow: '0px 0px 10px #FF6801',
        color: '#07152A',
      },
      '.Tab--selected:hover': {
        backgroundColor: '#ECECEC',
        color: '#fff',
      },
    },
  };
  
  async function handleSubmit(event) {
  isPaymentButtonDisabled.value = true
  if (isLoading.value) return;
  isLoading.value = true;

  await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/success`,
    }
  })
      .then(function (result) {
        if (result.error) {
          messages.value.push(result.error.message);
        }
      });

  isPaymentButtonDisabled.value = false
  isLoading.value = false
}

async function getPaymentIntent() {
  try {
    isLoading.value = true;
    // Because your server route is GET /create-payment-intent
    const response = await $users.get("/create-payment-intent");

    // The server returns { clientSecret: '...' }
    const { clientSecret } = response.data;
    if (!clientSecret) {
      messages.value.push("No clientSecret found in response.");
      return;
    }

    // 3) Create Stripe elements using the returned clientSecret
    elements = stripe.elements({ 
      clientSecret: clientSecret,
      appearance
     });

    // 4) Create & mount the payment element
    const paymentElement = elements.create("payment",
      {layout: "tabs"}
    );
    paymentElement.mount("#payment-element");

    // 5) Create & mount the link authentication element
    const linkAuthenticationElement = elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#link-authentication-element");

  } catch (error) {
    console.error("Error fetching payment intent:", error);
    messages.value.push("An error occurred while fetching the payment intent.");
  } finally {
    isLoading.value = false;
  }
}

  
  
onMounted(async () => {
  try {
    stripe = await loadStripe(stripePublicKey);
    await getPaymentIntent();
  } catch (error) {
    console.error("Error loading Stripe or fetching Payment Intent:", error);
    messages.value.push("Error loading Stripe or fetching Payment Intent.");
  }
});
  
  
  </script>
  
  <style scoped>
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
  
  .intent-button {
    background-color: var(--Primary-Dark, #07152A);
    color: #ffffff;
    display: inline-block;
    padding: 10px 20px;
    margin: 15px 5px;
    border-radius: 50px;
    font-weight: 500;
    font-size: 16px;
    text-transform: uppercase;
    text-decoration: none;
    font-family: "halyard-text" !important;
  }
  
  p {
    color: var(--Primary-Dark, #07152A);
    font-family: "halyard-text" !important;
    font-size: 20px;
    font-weight: 300;
    line-height: 130%;
    margin-bottom: 20px;
  }
  
  h2 {
    color: var(--Primary-Dark, #07152A);
    font-family: "halyard-display" !important;
    font-size: 46px;
    font-weight: 400;
    line-height: 110%;
    margin-top: 30px;
    margin-bottom: 15px;
  }
  
  h3 {
    color: var(--Primary-Dark, #07152A);
    font-family: "halyard-display" !important;
    font-size: 38px;
    font-weight: 400;
    line-height: 120%;
    margin-top: 40px;
    margin-bottom: 15px;
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
  
  .disclosure-payment {
    font-size: 14px !important;
    color: rgba(7, 21, 42, 0.6);
    line-height: 1.3;
    margin-top: 20px;
  }
  
  .contact-info p, .contact-info a {
    font-size: 20px;
    font-family: "halyard-text" !important;
    color: var(--Primary-Dark, #07152A);
  }
  
  </style>