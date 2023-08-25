<template>
  <transition name="modal-fade">
    <div class="modal-backdrop"
      @click="close"
      >
      <div class="modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
        @click.stop=""
      >
        <header
          class="modal-header"
          id="modalTitle"
        >

          <slot name="header">
          </slot>

          <button
            type="button"
            class="btn-close"
            @click="close"
            aria-label="Close modal"
          >
            <img src="/static/images/icon_close.png"/>
          </button>

        </header>

        <section
          class="modal-body"
          id="modalDescription"
        >
          <slot name="body">
          </slot>
        </section>

        <footer class="modal-footer">
          <slot name="footer">
          </slot>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>

const BODY_CLASS_NAME = 'modal-open'

export default {
  name: 'Modal',
  mounted() {
    document.body.classList.add(BODY_CLASS_NAME)
  },
  beforeDestroy() {
    document.body.classList.remove(BODY_CLASS_NAME)
  },
  methods: {
    close() {
      this.$emit('close')
    },
  },
}

</script>



<style scoped>
  .modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    overflow: auto;
    align-items: flex-start;
    z-index: 2;
  }

  .modal {
    background: #FFFFFF;
    box-shadow: 2px 2px 20px 1px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    margin: 20px;
    width: 70%;
    overflow: auto;
    text-align: center;
  }
.modal video{
    max-height: 600px;
    max-width: 800px;
    width: auto !important;
    height: auto !important;
  }
 section img{
    max-height: 700px;
    max-width: 980px;
  }




  .modal-header,
  .modal-footer {
    height: 40px;
    display: flex;
  }
  .modal-header{
    border: 1px solid #ddd;
    background-color: #f0f0f0;
    position: relative;
    margin-bottom: 20px;
  }

  .modal-footer {
  }

  .modal-body {
    position: relative;
    padding: 0px 10px;
  }


  .modal-fade-enter,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity .5s ease;
  }


</style>
