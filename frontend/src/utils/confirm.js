import { ref } from 'vue';

const message = ref('');
const visible = ref(false);
let resolvePromise = null;

export const showConfirm = (msg) => {
  message.value = msg;
  visible.value = true;
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

export const handleConfirm = (result) => {
  visible.value = false;
  if (resolvePromise) {
    resolvePromise(result);
    resolvePromise = null;
  }
};

export const useConfirm = () => ({
  message,
  visible
});
