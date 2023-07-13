<template>
  <transition name="modal-fade">
    <div class="modal-backdrop">
      <div class="modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
      >
        <header
          class="modal-header"
          id="modalTitle"
        >
          <button
            type="button"
            class="btn-close"
            @click="close"
            aria-label="Close modal"
          ><img src="/static/images/icon_close.png"/>
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
  export default {
    name: 'Modal',
    methods: {
      close() {
        this.$emit('close')
      },
    },
  }
</script>



<style>
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
  }

  .modal {
    background: #FFFFFF;
    box-shadow: 2px 2px 20px 1px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    width: 70%;
    overflow: auto;
  }
  .modal img{
    max-height: 700px;
    max-width: 1000px;
    width: auto !important;
    height: auto !important;
  }
.modal video{
    max-height: 600px;
    max-width: 800px;
    width: auto !important;
    height: auto !important;
  }

.modal-backdrop .caption{
  padding: 0 50px;
  text-align: left;
}


  .modal-header,
  .modal-footer {
    height: 35px;
    display: flex;
  }

  .modal-header {
    position: relative;
  }

  .modal-footer {
  }

  .modal-body {
    position: relative;
    padding: 0px 10px;
  }

  .btn-close {
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    padding: 0px;
    cursor: pointer;
    background: #fff;
    margin-right: 5px;
  }

  .btn-green {
    color: white;
    background: #4AAE9B;
    border: 1px solid #4AAE9B;
    border-radius: 2px;
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
