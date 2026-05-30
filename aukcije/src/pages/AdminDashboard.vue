<template>
    <q-page class="bg-white">
        <div class=" q-px-xl">
            <h4>{{ $t('adminPage.title') }}</h4>
        </div>
        <div class="q-px-xl q-gutter-lg">
            <q-btn class="q-px-lg" color="primary" :label="$t('adminPage.categories')" to="/ErorrNotFound.vue"/>
            <q-btn class="q-px-lg" color="primary" :label="$t('adminPage.users')" to="/ErorrNotFound.vue" />
            <q-btn class="q-px-lg" color="primary" :label="$t('adminPage.auctions')" to="/ErorrNotFound.vue"/>
        </div>

        <!--ovo ce ici na poseban page kasnije-->
        <div class="column ">
            <div class="row">
                <h5>{{ $t('adminPage.addCategoryTitle') }}</h5>
            </div>
            <div class="row">
                <q-card square bredered class="q-pa-md">
                    <q-card-section>
                        <q-form>
                            <q-input square filled v-model="naziv_kategorije" type="text" :label="$t('adminPage.categoryName')"/>
                            <div class="text-center"><q-btn size="lg" type="submit" :label="$t('adminPage.addCategory')" class="color-primary"></q-btn></div>
                        </q-form>
                    </q-card-section>
                </q-card>
            </div>
        </div>

    </q-page>

    
</template>


<script>
    import { ref } from 'vue'

    export default {
    setup () {
        return {
        splitterModel: ref(150) // start at 150px
        }
    }
    }
</script>

<style>
.justify-center{
    justify-content: center;
}
</style>