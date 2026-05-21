<template>
  <div>
    <h5>{{ t('accountsPage.title') }}</h5>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>