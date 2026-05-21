<script>
import axios from 'axios';
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const { t } = useI18n();
    return { t };
  },

  created() {
    this.logout();
  },

  methods: {
    async logout() {
      try {
        await axios.get('http://localhost:3000/logout'); 

        this.$router.push('/Prijava');

        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.t('auth.logoutSuccess'),
          icon: 'check_circle'
        });

      } catch (error) {
        console.error('Error logging out:', error);

        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.t('auth.logoutError'),
          icon: 'warning'
        });
      }
    }
  }
};
</script>