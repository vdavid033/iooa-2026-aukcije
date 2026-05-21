<template>
  <q-page class="bg-white">
    <div class="q-px-xl">
      <h4>{{ t('adminPage.title') }}</h4>
    </div>

    <div class="q-px-xl q-gutter-lg">
      <q-btn class="q-px-lg" color="primary" :label="t('adminPage.categories')" to="/ErorrNotFound.vue" />
      <q-btn class="q-px-lg" color="primary" :label="t('adminPage.users')" to="/ErorrNotFound.vue" />
      <q-btn class="q-px-lg" color="primary" :label="t('adminPage.auctions')" to="/ErorrNotFound.vue" />
    </div>

    <div class="column">
      <div class="row">
        <h5>{{ t('adminPage.addCategoryTitle') }}</h5>
      </div>

      <div class="row">
        <q-card square bordered class="q-pa-md">
          <q-card-section>
            <q-form>
              <q-input
                square
                filled
                v-model="naziv_kategorije"
                type="text"
                :label="t('adminPage.categoryName')"
              />

              <div class="text-center">
                <q-btn
                  size="lg"
                  type="submit"
                  :label="t('adminPage.addCategory')"
                  class="color-primary"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  setup () {
    const { t } = useI18n()

    return {
      t,
      splitterModel: ref(150)
    }
  },

  data() {
    return {
      naziv_kategorije: ''
    }
  }
}
</script>