<template functional>
    <a target="_blank" rel="nofollow" class="translate_lnk"
        :href="'https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text=' + $options.plainText(props.text)"
        >
        <img class="translate_btn" 
            src="/static/images/icon_translate.png"
            :title="props.title"
        />
    </a>
</template>

<script>

import {plainText} from '../utils'

export default {
  props: {
    text: String,
    title: String
  },
  name: 'TranslateLink',
  plainText
}
</script>

