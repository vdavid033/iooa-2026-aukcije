<template>
  <q-card class="q-pa-sm flex justify-center">
    <div class="q-pa-xl q-gutter-xl">
      <input type="file" @change="onFileChange" />

      <q-input
        :label="t('imageConverterPage.enterUrl')"
        type="text"
        v-model="imageUrl"
      />

      <q-btn
        @click="convertImage"
        :label="t('imageConverterPage.convert')"
      />

      <q-separator></q-separator>

      <div v-if="base64Image">
        <img :src="base64Image" />

        <q-separator></q-separator>

        <q-btn
          class="flex-flex-center"
          :label="t('imageConverterPage.copy')"
          @click="copyToClipboard"
        />

        <div class="q-pa-sm" style="max-width: 700px; overflow-wrap: break-word">
          data:image/jpg;base64,{{ base64Text }}
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const { t } = useI18n();
    return { t };
  },

  data() {
    return {
      file: null,
      base64Image: null,
      base64Text: null,
      imageUrl: "",
    };
  },

  methods: {
    onFileChange(e) {
      this.file = e.target.files[0];
    },

    async convertImage() {
      if (!this.file && !this.imageUrl) {
        return alert(this.t("imageConverterPage.noInput"));
      }

      if (this.imageUrl) {
        try {
          const response = await fetch(this.imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();

          reader.readAsDataURL(blob);

          reader.onload = () => {
            this.base64Image = reader.result;
            this.base64Text = reader.result.replace(
              /^data:image\/[a-z]+;base64,/,
              ""
            );
          };

          reader.onerror = (error) => {
            console.error(error);
          };
        } catch (error) {
          console.error(error);
          return alert(this.t("imageConverterPage.fetchError"));
        }
      } else {
        const reader = new FileReader();

        reader.readAsDataURL(this.file);

        reader.onload = () => {
          this.base64Image = reader.result;
          this.base64Text = reader.result.replace(
            /^data:image\/[a-z]+;base64,/,
            ""
          );
        };

        reader.onerror = (error) => {
          console.error(error);
        };
      }
    },

    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(
          "data:image/jpg;base64," + this.base64Text
        );

        alert(this.t("imageConverterPage.copySuccess"));
      } catch (err) {
        console.error(err);
        alert(this.t("imageConverterPage.copyError"));
      }
    },
  },
};
</script>
