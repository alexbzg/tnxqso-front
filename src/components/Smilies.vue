<template>
    <div id="smiles">
        <div id="close_smiles"><img src="/static/images/icon_delete20.png" @click="hide"></div>
        <div id="smiles_block">
            <template v-for="n in $options.SMILIES_COUNT">
                <div class="smile" :key="'smile_' + n" @click="smilieClick(n)">
                    <span>{{smilie(n)}}</span>
                    <img :src="$options.SMILIES_IMG_PATH + smilie(n) + '.gif'">
                </div>
                <br v-if="n % $options.SMILIES_ROW_LENGTH == 0" :key="'smile_br_' + n"/>
            </template>
        </div>
        <div id="smiles_link"><a href="http://www.kolobok.us/" target="_blank">www.kolobok.us</a></div>
    </div>
</template>
<script>
export const SMILIES_IMG_PATH = '/static/images/smiles/'

export default {
  SMILIES_IMG_PATH: SMILIES_IMG_PATH,
  SMILIES_COUNT: 70,
  SMILIES_ROW_LENGTH: 10,
  name: 'Smilies',
  data () {
    return {
    }
  },
  methods: {
    smilie (n) {
      return n < 10 ? '0' + n : n
    },
    smilieClick (n) {
      this.$emit('smilie-click', this.smilie(n))
    },
    hide () {
      this.$emit('hide')
    }
  }
}
</script>
