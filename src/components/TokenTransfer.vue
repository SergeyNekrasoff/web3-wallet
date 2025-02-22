<template>
  <div class="token-transfer space-y-4">
    <input
      v-model="recipientAddress"
      type="text"
      placeholder="Recipient address"
      class="w-full rounded-md border p-2"
    />

    <input
      v-model="amount"
      type="number"
      placeholder="Tokens qty"
      class="w-full rounded-md border p-2"
    />

    <button
      :disabled="!walletStore.isConnected"
      @click="sendTokens"
      class="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 border-2 hover:bg-primary/90 cursor-pointer"
    >
      Send tokens
    </button>

    <div v-if="transactionStatus === 'success'" class="text-green-500">Transaction successful</div>
    <div v-else-if="transactionStatus === 'error'" class="text-red-500">
      Error sending transaction
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ethers } from 'ethers'
import { useWalletStore } from '../stores/wallet'

const walletStore = useWalletStore()

const recipientAddress = ref('')
const amount = ref('')
const transactionStatus = ref<'pending' | 'success' | 'error'>()

async function sendTokens() {
  if (!walletStore.isConnected || !recipientAddress.value || !amount.value) return

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    const tokenContract = new ethers.Contract(
      process.env.VUE_APP_TOKEN_ADDRESS!, // replace token
      [
        'function transfer(0xeeeEB792D818e8F2c9B75A17f137851C6AB2F3dD, uint256 amount)) public returns (bool)',
      ],
      signer,
    )

    transactionStatus.value = 'pending'

    const tx = await tokenContract.transfer(recipientAddress.value, ethers.parseEther(amount.value))
    await tx.wait()

    transactionStatus.value = 'success'
    walletStore.updateBalances()
  } catch (error) {
    transactionStatus.value = 'error'
    console.error('Transaction failed:', error)
  }
}
</script>

<style lang="scss" scoped></style>
