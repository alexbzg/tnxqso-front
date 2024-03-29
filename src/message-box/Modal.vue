<template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper" 
                @click="outsideClickClose && $emit('cancel')">
                <div class="modal-container"
                    @click.stop="">

                    <div class="modal-header" v-if="title || hideButtons">
                        <span v-if="title" v-html="title"/>
                        <button
                            v-if="hideButtons"
                            type="button"
                            class="modal-close-button"
                            @click="$emit('cancel')"
                            aria-label="Close modal"
                        >
                            <img src="/static/images/icon_close.png"/>
                        </button>
                    </div>

                    <div class="modal-body" v-html="message" v-if="message">
                    </div>
                    <div class="modal-body" v-else>
                        <slot></slot>
                    </div>

                    <div class="modal-footer" v-if="!hideButtons">
                        <button 
                            class="modal-default-button" 
                            @click="$emit('confirm')">
                            OK
                        </button>
                        <button 
                            class="modal-cancel-button" 
                            @click="$emit('cancel')"
                            v-if="cancel_button">
                            {{getString('CANCEL')}}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>

import LocalizationMixin from '../localization-mixin'

export default {
  mixins: [LocalizationMixin],
  props: ["title", "message", "cancel_button", "hideButtons", "outsideClickClose"],
  name: "Modal"
}

</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 350px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: 'Jost', sans-serif;
  position: relative;
}

.modal-header{
  font-weight: bold;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button, .modal-cancel-button {
  padding: 5px 15px ;
  border-radius: 5px;
  border: 1px solid #ccc;
  cursor: pointer;
  line-height: 16px;
  margin: 0 5px;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

</style>


