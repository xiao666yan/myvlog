import { ref } from 'vue';

const message = ref('');
const type = ref('info');
const visible = ref(false);
let timer = null;

export const showMessage = (msg, msgType = 'info') => {
  message.value = msg;
  type.value = msgType;
  visible.value = true;
  
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    visible.value = false;
  }, 3000);
};

export const useMessage = () => ({
  message,
  type,
  visible
});
